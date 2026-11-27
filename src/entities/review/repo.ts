import type { ModerationStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/shared/lib/errors";
import type { ModerationOutcome } from "@/lib/moderation/types";
import type { CreateReviewInput } from "./schema";
import type {
  ModerationReviewFilter,
  ModerationReviewItem,
  ProviderReviewFilter,
  ProviderReviewItem,
  ProviderReviewSummary,
  ReviewableBooking,
  ReviewItem,
  ReviewKind,
} from "./type";

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
    where: { ...serviceWhere(kind, serviceId), status: "approved" },
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

/** Review chưa được hiển thị (chờ duyệt / bị ẩn) của chính customer cho dịch vụ. */
export function findOwnUnpublished(customerId: string, kind: ReviewKind, serviceId: string) {
  return prisma.review.findMany({
    where: { ...serviceWhere(kind, serviceId), customerId, status: { not: "approved" } },
    orderBy: { createdAt: "desc" },
    select: { id: true, rating: true, content: true, status: true, moderationReason: true, createdAt: true },
  });
}

function providerWhere(
  kind: ReviewKind,
  providerProfileId: string
): Prisma.ReviewWhereInput {
  if (kind === "tour") return { tour: { providerProfileId } };
  if (kind === "hotel") return { hotel: { providerProfileId } };
  return { restaurant: { providerProfileId } };
}

/** Review của các dịch vụ thuộc một hồ sơ provider, mới nhất trước. */
export async function findPageByProviderProfileId(
  kind: ReviewKind,
  providerProfileId: string,
  filter: ProviderReviewFilter,
  { skip, take }: { skip: number; take: number }
): Promise<{ items: ProviderReviewItem[]; total: number }> {
  const where: Prisma.ReviewWhereInput = {
    ...providerWhere(kind, providerProfileId),
    status: "approved",
    ...(filter.rating ? { rating: filter.rating } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        rating: true,
        content: true,
        createdAt: true,
        customer: { select: { fullname: true } },
        tour: { select: { title: true, slug: true } },
        hotel: { select: { name: true, slug: true } },
        restaurant: { select: { name: true, slug: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);
  const items = rows.map(({ customer, tour, hotel, restaurant, ...row }) => {
    const service = tour
      ? { serviceName: tour.title, serviceSlug: tour.slug }
      : hotel
        ? { serviceName: hotel.name, serviceSlug: hotel.slug }
        : { serviceName: restaurant?.name ?? "", serviceSlug: restaurant?.slug ?? "" };
    return { ...row, customerName: customer.fullname, ...service };
  });
  return { items, total };
}

/** Điểm trung bình và phân bố sao của provider (không phụ thuộc bộ lọc). */
export async function summarizeByProviderProfileId(
  kind: ReviewKind,
  providerProfileId: string
): Promise<ProviderReviewSummary> {
  const groups = await prisma.review.groupBy({
    by: ["rating"],
    where: { ...providerWhere(kind, providerProfileId), status: "approved" },
    _count: { _all: true },
  });
  const distribution: ProviderReviewSummary["distribution"] = [0, 0, 0, 0, 0];
  let sum = 0;
  let total = 0;
  for (const g of groups) {
    if (g.rating < 1 || g.rating > 5) continue;
    distribution[g.rating - 1] = g._count._all;
    sum += g.rating * g._count._all;
    total += g._count._all;
  }
  return {
    total,
    average: total ? Math.round((sum / total) * 10) / 10 : 0,
    distribution,
  };
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

/** Tên dịch vụ của đơn (ngữ cảnh cho bước kiểm duyệt AI). */
export async function findServiceNameForBooking(
  kind: ReviewKind,
  code: string,
  customerId: string
): Promise<string | null> {
  const where = { code, customerId };
  if (kind === "tour") {
    const row = await prisma.tourBooking.findFirst({ where, select: { tourTitle: true } });
    return row?.tourTitle ?? null;
  }
  if (kind === "hotel") {
    const row = await prisma.hotelBooking.findFirst({ where, select: { hotelName: true } });
    return row?.hotelName ?? null;
  }
  const row = await prisma.restaurantBooking.findFirst({ where, select: { restaurantName: true } });
  return row?.restaurantName ?? null;
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

/** Tính lại điểm trung bình + số review của dịch vụ, chỉ tính review đã được duyệt. */
async function recomputeServiceRating(tx: Tx, kind: ReviewKind, serviceId: string) {
  const stats = await tx.review.aggregate({
    where: { ...serviceWhere(kind, serviceId), status: "approved" },
    _avg: { rating: true },
    _count: true,
  });
  const data = {
    ratingAvg: Math.round((stats._avg.rating ?? 0) * 10) / 10,
    reviewCount: stats._count,
  };
  const where = { id: serviceId };
  if (kind === "tour") await tx.tour.update({ where, data });
  else if (kind === "hotel") await tx.hotel.update({ where, data });
  else await tx.restaurant.update({ where, data });
}

/** Customer đánh giá một đơn đã hoàn thành (kèm kết quả kiểm duyệt); cập nhật lại điểm trung bình của dịch vụ. */
export function create(
  customerId: string,
  input: CreateReviewInput,
  moderation: ModerationOutcome
) {
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

    const review = await tx.review.create({
      data: {
        customerId,
        rating,
        content,
        status: moderation.status,
        moderationSource: moderation.source,
        moderationReason: moderation.reason,
        moderationCategories: moderation.categories,
        moderatedAt: new Date(),
        ...(kind === "tour"
          ? { tourId: booking.serviceId, tourBookingId: booking.id }
          : kind === "hotel"
            ? { hotelId: booking.serviceId, hotelBookingId: booking.id }
            : { restaurantId: booking.serviceId, restaurantBookingId: booking.id }),
      },
      select: { id: true },
    });

    if (moderation.status === "approved") {
      await recomputeServiceRating(tx, kind, booking.serviceId);
    }

    return { slug, reviewId: review.id };
  });
}

// ---- Kiểm duyệt (admin) ----

const moderationSelect = {
  id: true,
  rating: true,
  content: true,
  status: true,
  moderationSource: true,
  moderationReason: true,
  moderationCategories: true,
  moderatedAt: true,
  createdAt: true,
  customer: { select: { fullname: true, email: true } },
  tour: { select: { id: true, title: true, slug: true } },
  hotel: { select: { id: true, name: true, slug: true } },
  restaurant: { select: { id: true, name: true, slug: true } },
  tourBooking: { select: { code: true } },
  hotelBooking: { select: { code: true } },
  restaurantBooking: { select: { code: true } },
} satisfies Prisma.ReviewSelect;

type ModerationRow = Prisma.ReviewGetPayload<{ select: typeof moderationSelect }>;

function toModerationItem(row: ModerationRow): ModerationReviewItem {
  const { customer, tour, hotel, restaurant, tourBooking, hotelBooking, restaurantBooking, ...rest } = row;
  const service = tour
    ? { kind: "tour" as const, serviceId: tour.id, serviceName: tour.title, serviceSlug: tour.slug }
    : hotel
      ? { kind: "hotel" as const, serviceId: hotel.id, serviceName: hotel.name, serviceSlug: hotel.slug }
      : {
          kind: "restaurant" as const,
          serviceId: restaurant?.id ?? null,
          serviceName: restaurant?.name ?? "(đã xóa)",
          serviceSlug: restaurant?.slug ?? null,
        };
  return {
    ...rest,
    ...service,
    customerName: customer.fullname,
    customerEmail: customer.email,
    bookingCode: tourBooking?.code ?? hotelBooking?.code ?? restaurantBooking?.code ?? null,
  };
}

function moderationWhere(filter: ModerationReviewFilter): Prisma.ReviewWhereInput {
  return {
    ...(filter.status ? { status: filter.status } : {}),
    ...(filter.source ? { moderationSource: filter.source } : {}),
    ...(filter.q
      ? {
          OR: [
            { content: { contains: filter.q, mode: "insensitive" } },
            { customer: { fullname: { contains: filter.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

export async function findPageForModeration(
  filter: ModerationReviewFilter,
  { skip, take }: { skip: number; take: number }
): Promise<{ items: ModerationReviewItem[]; total: number }> {
  const where = moderationWhere(filter);
  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: moderationSelect,
    }),
    prisma.review.count({ where }),
  ]);
  return { items: rows.map(toModerationItem), total };
}

export async function countByStatus(): Promise<Record<ModerationStatus, number>> {
  const groups = await prisma.review.groupBy({ by: ["status"], _count: { _all: true } });
  const result: Record<ModerationStatus, number> = { approved: 0, pending: 0, rejected: 0 };
  for (const g of groups) result[g.status] = g._count._all;
  return result;
}

/** Admin duyệt/ẩn review; tính lại điểm dịch vụ. Trả về thông tin để revalidate + thông báo. */
export function setStatus(id: string, status: ModerationStatus, reason?: string | null) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.review.findUnique({
      where: { id },
      select: { status: true, tourId: true, hotelId: true, restaurantId: true },
    });
    if (!current) throw new NotFoundError("Không tìm thấy đánh giá.");

    const kind: ReviewKind = current.tourId ? "tour" : current.hotelId ? "hotel" : "restaurant";
    const serviceId = current.tourId ?? current.hotelId ?? current.restaurantId;
    const slug = serviceId ? await lockService(tx, kind, serviceId) : null;

    const row = await tx.review.update({
      where: { id },
      data: {
        status,
        moderationSource: "admin",
        moderatedAt: new Date(),
        ...(reason !== undefined ? { moderationReason: reason } : {}),
        ...(status === "approved" ? { moderationCategories: [] } : {}),
      },
      select: moderationSelect,
    });

    if (serviceId && slug && current.status !== status) {
      await recomputeServiceRating(tx, kind, serviceId);
    }

    return { previousStatus: current.status, item: toModerationItem(row), slug };
  });
}
