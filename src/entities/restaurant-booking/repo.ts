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
} from "./type";

const STALE_STATUS_MESSAGE = "Trạng thái đơn đã thay đổi, vui lòng tải lại.";

/**
 * Đặt bàn: không thanh toán nên tạo thẳng đơn confirmed.
 * Sức chứa tính theo từng khung giờ: tổng khách các đơn confirmed cùng ngày + giờ ≤ capacity.
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
        status: "confirmed",
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
        status: "confirmed",
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        note: input.note || null,
        confirmedAt: new Date(),
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
  const [total, items] = await prisma.$transaction([
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
        status: "confirmed",
        // Ngày lưu 00:00 UTC → so với hôm nay (giờ Việt Nam) là đủ cho "sắp tới"
        reservationDate: { gte: new Date(`${todayIsoDate()}T00:00:00Z`) },
      },
    }),
  ]);
  return { rows, upcoming };
}

/** Customer tự hủy đơn confirmed, chỉ khi còn trước giờ đặt bàn đủ hạn hủy. */
export function cancelForCustomer(code: string, customerId: string, reason: string) {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<
      { id: string; reservationDate: Date; startTime: string }[]
    >`
      SELECT "id", "reservationDate", "startTime" FROM "RestaurantBooking"
      WHERE "code" = ${code}
        AND "customerId" = ${customerId}
        AND "status" = 'confirmed'::"BookingStatus"
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
