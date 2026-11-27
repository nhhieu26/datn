import type { BookingStatus } from "@/generated/prisma/client";
import { average } from "@/entities/list-filter";
import { searchHistoryRepo } from "@/entities/search-history";
import { type EmbeddingKind, fetchVectors } from "@/lib/pinecone";
import { prisma } from "@/lib/prisma";

/** Booking thể hiện nhu cầu thật (bỏ qua đơn hủy, hết hạn, không đến, chưa thanh toán). */
const MEANINGFUL_STATUSES: BookingStatus[] = [
  "pending_confirmation",
  "paid",
  "confirmed",
  "completed",
];
/** Số booking gần nhất mỗi loại đưa vào hồ sơ. */
const BOOKINGS_PER_KIND = 20;

export type UserProfile = {
  /** trung bình vector lịch sử tìm kiếm + các mục đã đặt, đã chuẩn hóa L2 */
  vector: number[];
  /** giá trung bình các booking theo loại (tour: giá/khách, khách sạn: giá phòng/đêm) */
  avgPrice: Partial<Record<EmbeddingKind, number>>;
  /** mục đã đặt, không gợi ý lại */
  excludeIds: Set<string>;
};

function meanVector(vectors: number[][]): number[] | null {
  if (!vectors.length) return null;
  const dim = vectors[0].length;
  const sum = new Array<number>(dim).fill(0);
  let count = 0;
  for (const v of vectors) {
    if (v.length !== dim) continue;
    for (let i = 0; i < dim; i++) sum[i] += v[i];
    count++;
  }
  const norm = Math.hypot(...sum);
  if (!count || !norm) return null;
  return sum.map((x) => x / norm);
}

function unique(ids: (string | null | undefined)[]): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

async function loadBookings(userId: string) {
  const where = { customerId: userId, status: { in: MEANINGFUL_STATUSES } };
  const orderBy = { createdAt: "desc" } as const;
  const [tours, hotels, restaurants] = await Promise.all([
    prisma.tourBooking.findMany({
      where,
      orderBy,
      take: BOOKINGS_PER_KIND,
      select: { unitPrice: true, tourDeparture: { select: { tourId: true } } },
    }),
    prisma.hotelBooking.findMany({
      where,
      orderBy,
      take: BOOKINGS_PER_KIND,
      select: { unitPrice: true, room: { select: { hotelId: true } } },
    }),
    prisma.restaurantBooking.findMany({
      where,
      orderBy,
      take: BOOKINGS_PER_KIND,
      select: { restaurantId: true },
    }),
  ]);
  return {
    ids: {
      tour: unique(tours.map((b) => b.tourDeparture?.tourId)),
      hotel: unique(hotels.map((b) => b.room?.hotelId)),
      restaurant: unique(restaurants.map((b) => b.restaurantId)),
    },
    avgPrice: {
      tour: average(tours.map((b) => Number(b.unitPrice))),
      hotel: average(hotels.map((b) => Number(b.unitPrice))),
    },
  };
}

/**
 * Hồ sơ sở thích của người dùng từ 20 lượt tìm kiếm gần nhất và các booking gần đây.
 * null khi chưa có dữ liệu nào để suy ra sở thích.
 */
export async function buildUserProfile(userId: string): Promise<UserProfile | null> {
  const [searchVectors, bookings] = await Promise.all([
    searchHistoryRepo.findRecentEmbeddings(userId),
    loadBookings(userId),
  ]);

  const bookedKinds = (["tour", "hotel", "restaurant"] as const).filter(
    (kind) => bookings.ids[kind].length > 0,
  );
  const bookedVectors = await Promise.all(
    bookedKinds.map(async (kind) => {
      try {
        return [...(await fetchVectors(kind, bookings.ids[kind])).values()];
      } catch (error) {
        console.error(`buildUserProfile fetchVectors(${kind}):`, error);
        return [];
      }
    }),
  );

  const vector = meanVector([...searchVectors, ...bookedVectors.flat()]);
  if (!vector) return null;

  const avgPrice: UserProfile["avgPrice"] = {};
  for (const kind of ["tour", "hotel"] as const) {
    const price = bookings.avgPrice[kind];
    if (price) avgPrice[kind] = price;
  }

  return {
    vector,
    avgPrice,
    excludeIds: new Set(Object.values(bookings.ids).flat()),
  };
}
