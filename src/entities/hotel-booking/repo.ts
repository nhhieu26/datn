import { randomUUID } from "node:crypto";
import { Prisma, type BookingStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  canCustomerCancelBefore,
  CUSTOMER_CANCEL_CUTOFF_HOURS,
  formatEntityCode,
  hasCheckedOut,
} from "@/lib/utils";
import { ConflictError, NotFoundError } from "@/shared/lib/errors";
import type {
  CreateHotelBookingInput,
  HotelBookingDetail,
  HotelBookingFilter,
  HotelBookingProviderDetail,
} from "./type";

type Tx = Prisma.TransactionClient;

const HOLD_MINUTES = Number(process.env.BOOKING_HOLD_MINUTES ?? 10);
const COMMISSION_RATE = Number(process.env.PLATFORM_COMMISSION_RATE ?? 0.1);
const DAY = 86_400_000;

const toUtcDate = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`);

/**
 * Chuyển các booking pending_payment khớp `condition` sang expired.
 * Tồn phòng tính động từ các booking còn hiệu lực nên không cần trả lại gì.
 * Bỏ qua booking đang có Payment `processing` (đang capture) và booking đang bị khóa.
 */
function releaseWhere(db: Tx | typeof prisma, condition: Prisma.Sql) {
  const now = new Date();
  return db.$executeRaw`
    UPDATE "HotelBooking" b
    SET "status" = 'expired', "cancelledAt" = ${now}, "updatedAt" = ${now}
    WHERE b."id" IN (
      SELECT h."id" FROM "HotelBooking" h
      WHERE h."status" = 'pending_payment'
        AND ${condition}
        AND NOT EXISTS (
          SELECT 1 FROM "Payment" p
          WHERE p."hotelBookingId" = h."id" AND p."status" = 'processing'
        )
      FOR UPDATE SKIP LOCKED
    )`;
}

/** Nhả các booking hết hạn giữ phòng. Gọi trước khi đọc số phòng trống. */
export function releaseExpired(db: Tx | typeof prisma = prisma) {
  return releaseWhere(db, Prisma.sql`h."expiresAt" < ${new Date()}`);
}

/** Giữ phòng: kiểm tra phòng trống theo khoảng ngày và tạo booking pending_payment hết hạn sau HOLD_MINUTES. */
export function createHeld(customerId: string, input: CreateHotelBookingInput) {
  return prisma.$transaction(async (tx) => {
    await releaseExpired(tx);
    // Mỗi customer chỉ giữ một đơn chờ thanh toán cho cùng loại phòng
    await releaseWhere(
      tx,
      Prisma.sql`h."customerId" = ${customerId} AND h."roomId" = ${input.roomId}`
    );

    const room = await tx.room.findFirst({
      where: {
        id: input.roomId,
        status: "published",
        hotel: { status: "published" },
      },
      include: { hotel: true },
    });
    if (!room) throw new NotFoundError("Phòng không còn mở bán.");

    // Khóa room để các lượt đặt cùng loại phòng chạy tuần tự khi kiểm tra tồn phòng
    await tx.$queryRaw`SELECT "id" FROM "Room" WHERE "id" = ${room.id} FOR UPDATE`;

    const checkInDate = toUtcDate(input.checkIn);
    const checkOutDate = toUtcDate(input.checkOut);
    const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / DAY);

    if (input.guests > room.capacity * input.rooms) {
      throw new ConflictError(
        `Tối đa ${room.capacity * input.rooms} khách cho số phòng đã chọn.`
      );
    }

    const [{ booked }] = await tx.$queryRaw<{ booked: number }[]>`
      SELECT COALESCE(SUM("roomQuantity"), 0)::int AS "booked"
      FROM "HotelBooking"
      WHERE "roomId" = ${room.id}
        AND "status" IN ('pending_payment', 'paid', 'confirmed')
        AND "checkInDate" < ${checkOutDate}
        AND "checkOutDate" > ${checkInDate}`;
    if (booked + input.rooms > room.quantity) {
      throw new ConflictError("Không còn đủ phòng trống cho ngày đã chọn.");
    }

    // Giá luôn tính lại ở server, không tin dữ liệu từ client
    const unitPrice = room.basePrice;
    const totalAmount = unitPrice.mul(nights).mul(input.rooms);
    const platformFee = totalAmount.mul(COMMISSION_RATE).toDecimalPlaces(2);

    return tx.hotelBooking.create({
      data: {
        code: formatEntityCode("HB", randomUUID()),
        customerId,
        providerProfileId: room.hotel.providerProfileId,
        roomId: room.id,
        hotelName: room.hotel.name,
        roomName: room.name,
        checkInDate,
        checkOutDate,
        nights,
        roomQuantity: input.rooms,
        guests: input.guests,
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        note: input.note || null,
        unitPrice,
        totalAmount,
        commissionRate: COMMISSION_RATE,
        platformFee,
        providerAmount: totalAmount.sub(platformFee),
        expiresAt: new Date(Date.now() + HOLD_MINUTES * 60_000),
      },
    });
  });
}

export function findByCodeForCustomer(
  code: string,
  customerId: string
): Promise<HotelBookingDetail | null> {
  return prisma.hotelBooking.findFirst({
    where: { code, customerId },
    include: {
      room: {
        include: { hotel: { select: { slug: true, province: true } } },
      },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
}

export function createPayment(data: {
  hotelBookingId: string;
  amount: Prisma.Decimal;
  chargedAmount: string;
  exchangeRate: number;
  gatewayOrderId: string;
}) {
  return prisma.payment.create({
    data: { ...data, gateway: "paypal", chargedCurrency: "USD" },
  });
}

export function findPaymentByOrderId(gatewayOrderId: string) {
  return prisma.payment.findFirst({
    where: { gatewayOrderId, hotelBookingId: { not: null } },
    include: { hotelBooking: { select: { id: true, code: true, customerId: true } } },
  });
}

/**
 * Khóa booking và chuyển payment pending → processing, chỉ khi booking còn được giữ phòng.
 * Trả false nếu booking đã hết hạn / đã thanh toán → không được capture.
 */
export function markPaymentProcessing(paymentId: string, bookingId: string) {
  return prisma.$transaction(async (tx) => {
    const held = await tx.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "HotelBooking"
      WHERE "id" = ${bookingId}
        AND "status" = 'pending_payment'
        AND "expiresAt" > ${new Date()}
      FOR UPDATE`;
    if (held.length === 0) return false;
    const { count } = await tx.payment.updateMany({
      where: { id: paymentId, hotelBookingId: bookingId, status: "pending" },
      data: { status: "processing" },
    });
    return count === 1;
  });
}

export function markPaid(input: {
  paymentId: string;
  bookingId: string;
  captureId: string | null;
  raw: Prisma.InputJsonValue;
}) {
  const now = new Date();
  return prisma.$transaction([
    prisma.payment.update({
      where: { id: input.paymentId },
      data: {
        status: "succeeded",
        gatewayCaptureId: input.captureId,
        paidAt: now,
        failureReason: null,
        rawResponse: input.raw,
      },
    }),
    prisma.hotelBooking.update({
      where: { id: input.bookingId },
      data: { status: "paid", expiresAt: null },
    }),
  ]);
}

export function markPaymentFailed(
  paymentId: string,
  reason: string,
  raw?: Prisma.InputJsonValue
) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: { status: "failed", failureReason: reason, rawResponse: raw },
  });
}

// --- Provider xem danh sách đơn ---

function providerWhere(
  providerProfileId: string,
  filter: HotelBookingFilter = {}
): Prisma.HotelBookingWhereInput {
  const q = filter.q?.trim();
  return {
    providerProfileId,
    ...(filter.status && { status: filter.status }),
    ...(filter.hotelName && { hotelName: filter.hotelName }),
    ...((filter.createdFrom || filter.createdTo) && {
      createdAt: { gte: filter.createdFrom, lte: filter.createdTo },
    }),
    ...(q && {
      OR: [
        { hotelName: { contains: q, mode: "insensitive" } },
        { roomName: { contains: q, mode: "insensitive" } },
        { contactName: { contains: q, mode: "insensitive" } },
        { contactEmail: { contains: q, mode: "insensitive" } },
        { contactPhone: { contains: q } },
      ],
    }),
  };
}

export async function findPageByProviderProfileId(
  providerProfileId: string,
  filter: HotelBookingFilter,
  page: { skip: number; take: number }
) {
  const where = providerWhere(providerProfileId, filter);
  const [total, items] = await prisma.$transaction([
    prisma.hotelBooking.count({ where }),
    prisma.hotelBooking.findMany({
      where,
      skip: page.skip,
      take: page.take,
      include: {
        payments: { select: { status: true }, orderBy: { createdAt: "desc" } },
        refunds: { select: { status: true } },
        room: {
          select: { images: true, hotel: { select: { images: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { items, total };
}

/** Số đơn và tổng tiền thực nhận theo từng trạng thái, không phụ thuộc bộ lọc. */
export function summarizeByStatus(providerProfileId: string) {
  return prisma.hotelBooking.groupBy({
    by: ["status"],
    where: { providerProfileId },
    _count: { _all: true },
    _sum: { providerAmount: true },
  });
}

// --- Customer xem danh sách đơn ---

export async function findPageByCustomerId(
  customerId: string,
  statuses: BookingStatus[] | undefined,
  page: { skip: number; take: number }
) {
  const where: Prisma.HotelBookingWhereInput = {
    customerId,
    ...(statuses && { status: { in: statuses } }),
  };
  const [total, items] = await prisma.$transaction([
    prisma.hotelBooking.count({ where }),
    prisma.hotelBooking.findMany({
      where,
      skip: page.skip,
      take: page.take,
      include: {
        payments: { select: { status: true }, orderBy: { createdAt: "desc" } },
        refunds: { select: { status: true } },
        room: {
          select: { images: true, hotel: { select: { images: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { items, total };
}

/** Số đơn và tổng tiền theo từng trạng thái của customer, không phụ thuộc tab đang chọn. */
export function summarizeByCustomerId(customerId: string) {
  return prisma.hotelBooking.groupBy({
    by: ["status"],
    where: { customerId },
    _count: { _all: true },
    _sum: { totalAmount: true },
  });
}

export async function findHotelNames(providerProfileId: string) {
  const rows = await prisma.hotelBooking.findMany({
    where: { providerProfileId },
    select: { hotelName: true },
    distinct: ["hotelName"],
    orderBy: { hotelName: "asc" },
  });
  return rows.map((row) => row.hotelName);
}

export function findByCodeForProvider(
  code: string,
  providerProfileId: string
): Promise<HotelBookingProviderDetail | null> {
  return prisma.hotelBooking.findFirst({
    where: { code, providerProfileId },
    include: {
      room: {
        select: {
          images: true,
          hotel: {
            select: {
              images: true,
              address: true,
              province: { select: { name: true } },
            },
          },
        },
      },
      customer: { select: { fullname: true } },
      payments: { include: { refunds: true }, orderBy: { createdAt: "desc" } },
      refunds: true,
      payout: true,
    },
  });
}

// --- Provider chuyển trạng thái đơn ---

const STALE_STATUS_MESSAGE = "Trạng thái đơn đã thay đổi, vui lòng tải lại.";

/** Khóa booking của provider đang ở trạng thái `from`; không khớp → ConflictError. */
async function lockForProvider(
  tx: Tx,
  code: string,
  providerProfileId: string,
  from: BookingStatus
) {
  const rows = await tx.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "HotelBooking"
    WHERE "code" = ${code}
      AND "providerProfileId" = ${providerProfileId}
      AND "status" = ${from}::"BookingStatus"
    FOR UPDATE`;
  if (rows.length === 0) throw new ConflictError(STALE_STATUS_MESSAGE);
  return rows[0].id;
}

export function confirmForProvider(code: string, providerProfileId: string) {
  return prisma.$transaction(async (tx) => {
    const id = await lockForProvider(tx, code, providerProfileId, "paid");
    return tx.hotelBooking.update({
      where: { id },
      data: { status: "confirmed", confirmedAt: new Date() },
    });
  });
}

/**
 * Hủy đơn đã khóa: tạo Refund (processing) hoàn toàn bộ tiền.
 * Tồn phòng tính động từ các booking còn hiệu lực nên hủy là tự nhả phòng.
 */
async function cancelAndCreateRefund(tx: Tx, id: string, reason: string) {
  const payment = await tx.payment.findFirst({
    where: { hotelBookingId: id, status: "succeeded", gatewayCaptureId: { not: null } },
  });
  if (!payment?.gatewayCaptureId) {
    throw new ConflictError("Không tìm thấy giao dịch thanh toán để hoàn tiền.");
  }

  const booking = await tx.hotelBooking.update({
    where: { id },
    data: { status: "cancelled", cancelledAt: new Date(), cancelReason: reason },
  });
  const refund = await tx.refund.create({
    data: {
      hotelBookingId: id,
      paymentId: payment.id,
      status: "processing",
      amount: booking.totalAmount,
      chargedAmount: payment.chargedAmount,
      chargedCurrency: payment.chargedCurrency,
      reason,
    },
  });
  return { booking, refund, captureId: payment.gatewayCaptureId };
}

/** Provider hủy đơn đã thanh toán. */
export function cancelForProvider(
  code: string,
  providerProfileId: string,
  reason: string
) {
  return prisma.$transaction(async (tx) => {
    const id = await lockForProvider(tx, code, providerProfileId, "paid");
    return cancelAndCreateRefund(tx, id, reason);
  });
}

/** Customer tự hủy đơn paid/confirmed, chỉ khi còn trước ngày nhận phòng đủ hạn hủy. */
export function cancelForCustomer(code: string, customerId: string, reason: string) {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: string; checkInDate: Date }[]>`
      SELECT "id", "checkInDate" FROM "HotelBooking"
      WHERE "code" = ${code}
        AND "customerId" = ${customerId}
        AND "status" IN ('paid'::"BookingStatus", 'confirmed'::"BookingStatus")
      FOR UPDATE`;
    if (rows.length === 0) throw new ConflictError(STALE_STATUS_MESSAGE);
    if (!canCustomerCancelBefore(rows[0].checkInDate)) {
      throw new ConflictError(
        `Chỉ có thể hủy đơn trước ngày nhận phòng ${CUSTOMER_CANCEL_CUTOFF_HOURS} giờ.`
      );
    }
    return cancelAndCreateRefund(tx, rows[0].id, reason);
  });
}

/** Hoàn thành đơn từ ngày trả phòng: tạo Payout (processing) cho provider. */
export function completeForProvider(code: string, providerProfileId: string) {
  return prisma.$transaction(async (tx) => {
    const id = await lockForProvider(tx, code, providerProfileId, "confirmed");
    const booking = await tx.hotelBooking.findUniqueOrThrow({
      where: { id },
      include: {
        providerProfile: { select: { paypalPayerId: true, payoutEmail: true } },
        payments: { where: { status: "succeeded" }, take: 1 },
      },
    });

    if (!hasCheckedOut(booking.checkOutDate)) {
      throw new ConflictError("Chỉ có thể hoàn thành đơn từ ngày trả phòng.");
    }

    const { paypalPayerId, payoutEmail } = booking.providerProfile;
    const receiver = paypalPayerId ?? payoutEmail;
    if (!receiver) {
      throw new ConflictError(
        "Vui lòng liên kết tài khoản PayPal ở mục Thanh toán / PayPal để nhận tiền."
      );
    }

    const exchangeRate =
      booking.payments[0]?.exchangeRate ??
      new Prisma.Decimal(process.env.PAYPAL_USD_RATE ?? 25_000);

    const updated = await tx.hotelBooking.update({
      where: { id },
      data: { status: "completed", completedAt: new Date() },
    });
    const payout = await tx.payout.create({
      data: {
        hotelBookingId: id,
        providerProfileId,
        gateway: "paypal",
        status: "processing",
        amount: booking.providerAmount,
        chargedAmount: booking.providerAmount.div(exchangeRate).toDecimalPlaces(2),
        chargedCurrency: "USD",
        exchangeRate,
        receiver,
      },
    });
    return {
      booking: updated,
      payout,
      // payer ID là "encrypted PayPal account number" → recipient_type PAYPAL_ID
      recipientType: paypalPayerId ? ("PAYPAL_ID" as const) : ("EMAIL" as const),
    };
  });
}
