import { randomUUID } from "node:crypto";
import type { BookingStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  canCustomerCancelBefore,
  formatEntityCode,
  reservationInstant,
  RESTAURANT_CANCEL_CUTOFF_HOURS,
  todayIsoDate,
} from "@/lib/utils";
import { ConflictError, NotFoundError } from "@/shared/lib/errors";
import type {
  CreateRestaurantBookingInput,
  RestaurantBookingDetail,
  RestaurantBookingFilter,
  RestaurantBookingProviderDetail,
} from "./type";

type Tx = Prisma.TransactionClient;

const STALE_STATUS_MESSAGE = "Trạng thái đơn đã thay đổi, vui lòng tải lại.";

/** Đơn đặt bàn còn hiệu lực: đang chờ nhà hàng xác nhận hoặc đã xác nhận. */
const ACTIVE_STATUSES: BookingStatus[] = ["pending_confirmation", "confirmed"];

/**
 * Đặt bàn: không thanh toán, tạo đơn pending_confirmation chờ nhà hàng duyệt.
 * Sức chứa tính theo từng khung giờ: tổng khách các đơn còn hiệu lực cùng ngày + giờ ≤ capacity.
 */
export function createConfirmed(
  customerId: string,
  input: CreateRestaurantBookingInput
) {
  return prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.findFirst({
      where: { slug: input.restaurantSlug, status: "published" },
      include: { timeSlots: { where: { startTime: input.slot } } },
    });
    if (!restaurant) throw new NotFoundError("Nhà hàng không còn nhận đặt bàn.");
    const slot = restaurant.timeSlots[0];
    if (!slot) throw new NotFoundError("Khung giờ không còn phục vụ.");

    // Khóa restaurant để các lượt đặt cùng nhà hàng chạy tuần tự khi kiểm tra sức chứa
    await tx.$queryRaw`SELECT "id" FROM "Restaurant" WHERE "id" = ${restaurant.id} FOR UPDATE`;

    if (reservationInstant(input.date, slot.startTime) <= new Date()) {
      throw new ConflictError("Khung giờ đã qua, vui lòng chọn giờ khác.");
    }
    if (input.guests > restaurant.capacity) {
      throw new ConflictError(`Tối đa ${restaurant.capacity} khách cho mỗi đơn.`);
    }

    const reservationDate = new Date(`${input.date}T00:00:00Z`);
    const { _sum } = await tx.restaurantBooking.aggregate({
      where: {
        restaurantId: restaurant.id,
        reservationDate,
        startTime: slot.startTime,
        status: { in: ACTIVE_STATUSES },
      },
      _sum: { guests: true },
    });
    const left = restaurant.capacity - (_sum.guests ?? 0);
    if (input.guests > left) {
      throw new ConflictError(
        left > 0
          ? `Khung giờ này chỉ còn ${left} chỗ.`
          : "Khung giờ này đã kín chỗ, vui lòng chọn giờ khác."
      );
    }

    return tx.restaurantBooking.create({
      data: {
        code: formatEntityCode("RB", randomUUID()),
        customerId,
        providerProfileId: restaurant.providerProfileId,
        restaurantId: restaurant.id,
        restaurantTimeSlotId: slot.id,
        restaurantName: restaurant.name,
        reservationDate,
        startTime: slot.startTime,
        guests: input.guests,
        status: "pending_confirmation",
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        note: input.note || null,
      },
    });
  });
}

export function findByCodeForCustomer(
  code: string,
  customerId: string
): Promise<RestaurantBookingDetail | null> {
  return prisma.restaurantBooking.findFirst({
    where: { code, customerId },
    include: {
      restaurant: {
        select: { slug: true, address: true, province: { select: { name: true } } },
      },
      restaurantTimeSlot: { select: { endTime: true } },
    },
  });
}

// --- Customer xem danh sách đơn ---

export async function findPageByCustomerId(
  customerId: string,
  statuses: BookingStatus[] | undefined,
  page: { skip: number; take: number }
) {
  const where: Prisma.RestaurantBookingWhereInput = {
    customerId,
    ...(statuses && { status: { in: statuses } }),
  };
  const [total, items] = await Promise.all([
    prisma.restaurantBooking.count({ where }),
    prisma.restaurantBooking.findMany({
      where,
      skip: page.skip,
      take: page.take,
      include: {
        restaurant: { select: { images: true, slug: true } },
        restaurantTimeSlot: { select: { endTime: true } },
        review: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { items, total };
}

/** Số đơn theo từng trạng thái và số đơn sắp tới của customer, không phụ thuộc tab đang chọn. */
export async function summarizeByCustomerId(customerId: string) {
  const [rows, upcoming] = await Promise.all([
    prisma.restaurantBooking.groupBy({
      by: ["status"],
      where: { customerId },
      _count: { _all: true },
    }),
    prisma.restaurantBooking.count({
      where: {
        customerId,
        status: { in: ACTIVE_STATUSES },
        // Ngày lưu 00:00 UTC → so với hôm nay (giờ Việt Nam) là đủ cho "sắp tới"
        reservationDate: { gte: new Date(`${todayIsoDate()}T00:00:00Z`) },
      },
    }),
  ]);
  return { rows, upcoming };
}

/** Customer tự hủy đơn chờ xác nhận / đã xác nhận, chỉ khi còn trước giờ đặt bàn đủ hạn hủy. */
export function cancelForCustomer(code: string, customerId: string, reason: string) {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<
      { id: string; reservationDate: Date; startTime: string }[]
    >`
      SELECT "id", "reservationDate", "startTime" FROM "RestaurantBooking"
      WHERE "code" = ${code}
        AND "customerId" = ${customerId}
        AND "status" IN ('pending_confirmation'::"BookingStatus", 'confirmed'::"BookingStatus")
      FOR UPDATE`;
    if (rows.length === 0) throw new ConflictError(STALE_STATUS_MESSAGE);
    const { id, reservationDate, startTime } = rows[0];
    if (
      !canCustomerCancelBefore(
        reservationInstant(reservationDate, startTime),
        new Date(),
        RESTAURANT_CANCEL_CUTOFF_HOURS
      )
    ) {
      throw new ConflictError(
        `Chỉ có thể hủy đơn trước giờ đặt bàn ${RESTAURANT_CANCEL_CUTOFF_HOURS} giờ.`
      );
    }
    return tx.restaurantBooking.update({
      where: { id },
      data: { status: "cancelled", cancelledAt: new Date(), cancelReason: reason },
    });
  });
}

// --- Provider xem danh sách đơn ---

function providerWhere(
  providerProfileId: string,
  filter: RestaurantBookingFilter = {}
): Prisma.RestaurantBookingWhereInput {
  const q = filter.q?.trim();
  return {
    providerProfileId,
    ...(filter.status && { status: filter.status }),
    ...(filter.restaurantName && { restaurantName: filter.restaurantName }),
    ...((filter.createdFrom || filter.createdTo) && {
      createdAt: { gte: filter.createdFrom, lte: filter.createdTo },
    }),
    ...(q && {
      OR: [
        { restaurantName: { contains: q, mode: "insensitive" } },
        { contactName: { contains: q, mode: "insensitive" } },
        { contactEmail: { contains: q, mode: "insensitive" } },
        { contactPhone: { contains: q } },
      ],
    }),
  };
}

export async function findPageByProviderProfileId(
  providerProfileId: string,
  filter: RestaurantBookingFilter,
  page: { skip: number; take: number }
) {
  const where = providerWhere(providerProfileId, filter);
  const [total, items] = await Promise.all([
    prisma.restaurantBooking.count({ where }),
    prisma.restaurantBooking.findMany({
      where,
      skip: page.skip,
      take: page.take,
      include: {
        restaurant: { select: { images: true } },
        restaurantTimeSlot: { select: { endTime: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { items, total };
}

/** Số đơn theo từng trạng thái và số đơn sắp tới của provider, không phụ thuộc bộ lọc. */
export async function summarizeByStatus(providerProfileId: string) {
  const [rows, upcoming] = await Promise.all([
    prisma.restaurantBooking.groupBy({
      by: ["status"],
      where: { providerProfileId },
      _count: { _all: true },
    }),
    prisma.restaurantBooking.count({
      where: {
        providerProfileId,
        status: { in: ACTIVE_STATUSES },
        reservationDate: { gte: new Date(`${todayIsoDate()}T00:00:00Z`) },
      },
    }),
  ]);
  return { rows, upcoming };
}

export async function findRestaurantNames(providerProfileId: string) {
  const rows = await prisma.restaurantBooking.findMany({
    where: { providerProfileId },
    select: { restaurantName: true },
    distinct: ["restaurantName"],
    orderBy: { restaurantName: "asc" },
  });
  return rows.map((row) => row.restaurantName);
}

export function findByCodeForProvider(
  code: string,
  providerProfileId: string
): Promise<RestaurantBookingProviderDetail | null> {
  return prisma.restaurantBooking.findFirst({
    where: { code, providerProfileId },
    include: {
      restaurant: {
        select: {
          images: true,
          address: true,
          province: { select: { name: true } },
        },
      },
      restaurantTimeSlot: { select: { endTime: true } },
      customer: { select: { fullname: true } },
    },
  });
}

// --- Provider chuyển trạng thái đơn ---

/** Khóa đơn của provider đang ở một trong các trạng thái `from`; không khớp → ConflictError. */
async function lockForProvider(
  tx: Tx,
  code: string,
  providerProfileId: string,
  from: BookingStatus[]
) {
  const rows = await tx.$queryRaw<
    { id: string; reservationDate: Date; startTime: string }[]
  >`
    SELECT "id", "reservationDate", "startTime" FROM "RestaurantBooking"
    WHERE "code" = ${code}
      AND "providerProfileId" = ${providerProfileId}
      AND "status"::text = ANY(${from})
    FOR UPDATE`;
  if (rows.length === 0) throw new ConflictError(STALE_STATUS_MESSAGE);
  return rows[0];
}

export function confirmForProvider(code: string, providerProfileId: string) {
  return prisma.$transaction(async (tx) => {
    const { id, reservationDate, startTime } = await lockForProvider(
      tx,
      code,
      providerProfileId,
      ["pending_confirmation"]
    );
    if (reservationInstant(reservationDate, startTime) <= new Date()) {
      throw new ConflictError("Đã qua giờ đặt bàn, không thể xác nhận.");
    }
    return tx.restaurantBooking.update({
      where: { id },
      data: { status: "confirmed", confirmedAt: new Date() },
    });
  });
}

/** Provider hoàn thành đơn sau giờ đặt bàn. */
export function completeForProvider(code: string, providerProfileId: string) {
  return prisma.$transaction(async (tx) => {
    const { id, reservationDate, startTime } = await lockForProvider(
      tx,
      code,
      providerProfileId,
      ["confirmed"]
    );
    if (reservationInstant(reservationDate, startTime) > new Date()) {
      throw new ConflictError("Chỉ có thể hoàn thành sau giờ đặt bàn.");
    }
    return tx.restaurantBooking.update({
      where: { id },
      data: { status: "completed", completedAt: new Date() },
    });
  });
}

/** Provider hủy đơn chờ xác nhận / đã xác nhận. Sức chứa tính động nên hủy là tự nhả chỗ. */
export function cancelForProvider(
  code: string,
  providerProfileId: string,
  reason: string
) {
  return prisma.$transaction(async (tx) => {
    const { id } = await lockForProvider(
      tx,
      code,
      providerProfileId,
      ACTIVE_STATUSES
    );
    return tx.restaurantBooking.update({
      where: { id },
      data: { status: "cancelled", cancelledAt: new Date(), cancelReason: reason },
    });
  });
}
