import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/shared/lib/errors";
import type { CreateReviewInput } from "./schema";
import type { ReviewableBooking, ReviewItem, ReviewKind } from "./type";

type Tx = Prisma.TransactionClient;

function serviceWhere(kind: ReviewKind, serviceId: string): Prisma.ReviewWhereInput {
  if (kind === "tour") return { tourId: serviceId };
  if (kind === "hotel") return { hotelId: serviceId };
  return { restaurantId: serviceId };
}

export async function findManyByService(
  kind: ReviewKind,
  serviceId: string,
  take: number
): Promise<ReviewItem[]> {
  const rows = await prisma.review.findMany({
    where: serviceWhere(kind, serviceId),
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      rating: true,
      content: true,
      createdAt: true,
      customer: { select: { fullname: true } },
    },
  });
  return rows.map(({ customer, ...row }) => ({
    ...row,
    customerName: customer.fullname,
  }));
}

export async function findReviewableBookings(
  customerId: string,
  kind: ReviewKind,
  serviceId: string
): Promise<ReviewableBooking[]> {
  const base = { customerId, status: "completed" as const, review: null };
  if (kind === "tour") {
    const rows = await prisma.tourBooking.findMany({
      where: { ...base, tourDeparture: { tourId: serviceId } },
      orderBy: { departureDate: "desc" },
      select: { code: true, departureDate: true },
    });
    return rows.map((r) => ({ code: r.code, date: r.departureDate }));
  }
  if (kind === "hotel") {
    const rows = await prisma.hotelBooking.findMany({
      where: { ...base, room: { hotelId: serviceId } },
      orderBy: { checkInDate: "desc" },
      select: { code: true, checkInDate: true },
    });
    return rows.map((r) => ({ code: r.code, date: r.checkInDate }));
  }
  const rows = await prisma.restaurantBooking.findMany({
    where: { ...base, restaurantId: serviceId },
    orderBy: { reservationDate: "desc" },
    select: { code: true, reservationDate: true },
  });
  return rows.map((r) => ({ code: r.code, date: r.reservationDate }));
}

type BookingForReview = {
  id: string;
  status: string;
  serviceId: string | null;
};

async function findBookingForReview(
  tx: Tx,
  kind: ReviewKind,
  code: string,
  customerId: string
): Promise<BookingForReview | null> {
  const where = { code, customerId };
  if (kind === "tour") {
    const row = await tx.tourBooking.findFirst({
      where,
      select: { id: true, status: true, tourDeparture: { select: { tourId: true } } },
    });
    return row && { id: row.id, status: row.status, serviceId: row.tourDeparture?.tourId ?? null };
  }
  if (kind === "hotel") {
    const row = await tx.hotelBooking.findFirst({
      where,
      select: { id: true, status: true, room: { select: { hotelId: true } } },
    });
    return row && { id: row.id, status: row.status, serviceId: row.room?.hotelId ?? null };
  }
  const row = await tx.restaurantBooking.findFirst({
    where,
    select: { id: true, status: true, restaurantId: true },
  });
  return row && { id: row.id, status: row.status, serviceId: row.restaurantId };
}

/** Khóa dịch vụ để các review cùng dịch vụ chạy tuần tự (chống trùng + tính lại điểm đúng). */
async function lockService(tx: Tx, kind: ReviewKind, id: string) {
  const rows =
    kind === "tour"
      ? await tx.$queryRaw<{ slug: string }[]>`SELECT "slug" FROM "Tour" WHERE "id" = ${id} FOR UPDATE`
      : kind === "hotel"
        ? await tx.$queryRaw<{ slug: string }[]>`SELECT "slug" FROM "Hotel" WHERE "id" = ${id} FOR UPDATE`
        : await tx.$queryRaw<{ slug: string }[]>`SELECT "slug" FROM "Restaurant" WHERE "id" = ${id} FOR UPDATE`;
  return rows[0]?.slug ?? null;
}

/** Customer đánh giá một đơn đã hoàn thành; cập nhật lại điểm trung bình của dịch vụ. */
export function create(customerId: string, input: CreateReviewInput) {
  const { kind, bookingCode, rating, content } = input;
  return prisma.$transaction(async (tx) => {
    const booking = await findBookingForReview(tx, kind, bookingCode, customerId);
    if (!booking) throw new NotFoundError("Không tìm thấy đơn đặt.");
    if (booking.status !== "completed") {
      throw new ForbiddenError("Chỉ đánh giá được đơn đã hoàn thành.");
    }
    if (!booking.serviceId) {
      throw new ConflictError("Dịch vụ của đơn này không còn tồn tại.");
    }
    const slug = await lockService(tx, kind, booking.serviceId);
    if (!slug) throw new ConflictError("Dịch vụ của đơn này không còn tồn tại.");

    const reviewed = await tx.review.count({
      where:
        kind === "tour"
          ? { tourBookingId: booking.id }
          : kind === "hotel"
            ? { hotelBookingId: booking.id }
            : { restaurantBookingId: booking.id },
    });
    if (reviewed > 0) throw new ConflictError("Bạn đã đánh giá đơn này rồi.");

    await tx.review.create({
      data: {
        customerId,
        rating,
        content,
        ...(kind === "tour"
          ? { tourId: booking.serviceId, tourBookingId: booking.id }
          : kind === "hotel"
            ? { hotelId: booking.serviceId, hotelBookingId: booking.id }
            : { restaurantId: booking.serviceId, restaurantBookingId: booking.id }),
      },
    });

    const stats = await tx.review.aggregate({
      where: serviceWhere(kind, booking.serviceId),
      _avg: { rating: true },
      _count: true,
    });
    const data = {
      ratingAvg: Math.round((stats._avg.rating ?? 0) * 10) / 10,
      reviewCount: stats._count,
    };
    const where = { id: booking.serviceId };
    if (kind === "tour") await tx.tour.update({ where, data });
    else if (kind === "hotel") await tx.hotel.update({ where, data });
    else await tx.restaurant.update({ where, data });

    return { slug };
  });
}
