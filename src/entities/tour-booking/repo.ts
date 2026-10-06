import { randomUUID } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { formatEntityCode } from "@/lib/utils";
import { ConflictError, NotFoundError } from "@/shared/lib/errors";
import type {
  CreateTourBookingInput,
  TourBookingDetail,
  TourBookingFilter,
  TourBookingProviderDetail,
} from "./type";

type Tx = Prisma.TransactionClient;

export const HOLD_MINUTES = Number(process.env.BOOKING_HOLD_MINUTES ?? 10);
const COMMISSION_RATE = Number(process.env.PLATFORM_COMMISSION_RATE ?? 0.1);

/**
 * Chuyển các booking pending_payment khớp `condition` sang expired và trả slot về departure.
 * Bỏ qua booking đang có Payment `processing` (đang capture) và booking đang bị khóa.
 */
function releaseWhere(db: Tx | typeof prisma, condition: Prisma.Sql) {
  const now = new Date();
  return db.$executeRaw`
    WITH released AS (
      UPDATE "TourBooking" b
      SET "status" = 'expired', "cancelledAt" = ${now}, "updatedAt" = ${now}
      WHERE b."id" IN (
        SELECT t."id" FROM "TourBooking" t
        WHERE t."status" = 'pending_payment'
          AND ${condition}
          AND NOT EXISTS (
            SELECT 1 FROM "Payment" p
            WHERE p."tourBookingId" = t."id" AND p."status" = 'processing'
          )
        FOR UPDATE SKIP LOCKED
      )
      RETURNING b."tourDepartureId", b."guests"
    )
    UPDATE "TourDeparture" d
    SET "bookedSlots" = GREATEST(0, d."bookedSlots" - r."total"), "updatedAt" = ${now}
    FROM (
      SELECT "tourDepartureId", SUM("guests")::int AS "total"
      FROM released WHERE "tourDepartureId" IS NOT NULL
      GROUP BY "tourDepartureId"
    ) r
    WHERE d."id" = r."tourDepartureId"`;
}

/** Nhả chỗ của các booking hết hạn giữ chỗ. Gọi trước khi đọc số chỗ trống. */
export function releaseExpired(db: Tx | typeof prisma = prisma) {
  return releaseWhere(db, Prisma.sql`t."expiresAt" < ${new Date()}`);
}

/** Giữ chỗ: trừ slot ngay và tạo booking pending_payment hết hạn sau HOLD_MINUTES. */
export function createHeld(customerId: string, input: CreateTourBookingInput) {
  return prisma.$transaction(async (tx) => {
    await releaseExpired(tx);
    // Mỗi customer chỉ giữ một đơn chờ thanh toán cho cùng departure
    await releaseWhere(
      tx,
      Prisma.sql`t."customerId" = ${customerId} AND t."tourDepartureId" = ${input.departureId}`
    );

    const departure = await tx.tourDeparture.findFirst({
      where: {
        id: input.departureId,
        status: "scheduled",
        tour: { status: "published" },
      },
      include: { tour: true },
    });
    if (!departure) throw new NotFoundError("Lịch khởi hành không còn mở bán.");

    const now = new Date();
    const reserved = await tx.$executeRaw`
      UPDATE "TourDeparture"
      SET "bookedSlots" = "bookedSlots" + ${input.guests}, "updatedAt" = ${now}
      WHERE "id" = ${departure.id}
        AND "status" = 'scheduled'
        AND "departureDate" > ${now}
        AND "bookedSlots" + ${input.guests} <= "totalSlots"`;
    if (reserved === 0) {
      throw new ConflictError("Không đủ chỗ trống cho số khách đã chọn.");
    }

    // Giá luôn tính lại ở server, không tin dữ liệu từ client
    const unitPrice = departure.price ?? departure.tour.basePrice;
    const totalAmount = unitPrice.mul(input.guests);
    const platformFee = totalAmount.mul(COMMISSION_RATE).toDecimalPlaces(2);

    return tx.tourBooking.create({
      data: {
        code: formatEntityCode("TB", randomUUID()),
        customerId,
        providerProfileId: departure.tour.providerProfileId,
        tourDepartureId: departure.id,
        tourTitle: departure.tour.title,
        departureDate: departure.departureDate,
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
        expiresAt: new Date(now.getTime() + HOLD_MINUTES * 60_000),
      },
    });
  });
}

export function findByCodeForCustomer(
  code: string,
  customerId: string
): Promise<TourBookingDetail | null> {
  return prisma.tourBooking.findFirst({
    where: { code, customerId },
    include: {
      tourDeparture: {
        include: { tour: { select: { slug: true, province: true } } },
      },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
}

export function findByCodeForProvider(
  code: string,
  providerProfileId: string
): Promise<TourBookingProviderDetail | null> {
  return prisma.tourBooking.findFirst({
    where: { code, providerProfileId },
    include: {
      tourDeparture: {
        include: {
          tour: {
            select: {
              slug: true,
              images: true,
              durationDays: true,
              durationNights: true,
              province: { select: { name: true } },
            },
          },
        },
      },
      customer: { select: { fullname: true } },
      payments: { orderBy: { createdAt: "desc" }, include: { refunds: true } },
      refunds: true,
      payout: true,
    },
  });
}

export function createPayment(data: {
  tourBookingId: string;
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
  return prisma.payment.findUnique({
    where: { gatewayOrderId },
    include: { tourBooking: { select: { id: true, code: true, customerId: true } } },
  });
}

/**
 * Khóa booking và chuyển payment pending → processing, chỉ khi booking còn được giữ chỗ.
 * Trả false nếu booking đã hết hạn / đã thanh toán → không được capture.
 */
export function markPaymentProcessing(paymentId: string, bookingId: string) {
  return prisma.$transaction(async (tx) => {
    const held = await tx.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "TourBooking"
      WHERE "id" = ${bookingId}
        AND "status" = 'pending_payment'
        AND "expiresAt" > ${new Date()}
      FOR UPDATE`;
    if (held.length === 0) return false;
    const { count } = await tx.payment.updateMany({
      where: { id: paymentId, tourBookingId: bookingId, status: "pending" },
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
    prisma.tourBooking.update({
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

function providerWhere(
  providerProfileId: string,
  filter: TourBookingFilter = {}
): Prisma.TourBookingWhereInput {
  const q = filter.q?.trim();
  return {
    providerProfileId,
    ...(filter.status && { status: filter.status }),
    ...(filter.tourTitle && { tourTitle: filter.tourTitle }),
    ...((filter.createdFrom || filter.createdTo) && {
      createdAt: { gte: filter.createdFrom, lte: filter.createdTo },
    }),
    ...(q && {
      OR: [
        { tourTitle: { contains: q, mode: "insensitive" } },
        { contactName: { contains: q, mode: "insensitive" } },
        { contactEmail: { contains: q, mode: "insensitive" } },
        { contactPhone: { contains: q } },
      ],
    }),
  };
}

export async function findPageByProviderProfileId(
  providerProfileId: string,
  filter: TourBookingFilter,
  page: { skip: number; take: number }
) {
  const where = providerWhere(providerProfileId, filter);
  const [total, items] = await prisma.$transaction([
    prisma.tourBooking.count({ where }),
    prisma.tourBooking.findMany({
      where,
      skip: page.skip,
      take: page.take,
      include: {
        payments: { select: { status: true }, orderBy: { createdAt: "desc" } },
        refunds: { select: { status: true } },
        tourDeparture: { select: { tour: { select: { images: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { items, total };
}

/** Số đơn và tổng tiền thực nhận theo từng trạng thái, không phụ thuộc bộ lọc. */
export function summarizeByStatus(providerProfileId: string) {
  return prisma.tourBooking.groupBy({
    by: ["status"],
    where: { providerProfileId },
    _count: { _all: true },
    _sum: { providerAmount: true },
  });
}

export async function findTourTitles(providerProfileId: string) {
  const rows = await prisma.tourBooking.findMany({
    where: { providerProfileId },
    select: { tourTitle: true },
    distinct: ["tourTitle"],
    orderBy: { tourTitle: "asc" },
  });
  return rows.map((row) => row.tourTitle);
}
