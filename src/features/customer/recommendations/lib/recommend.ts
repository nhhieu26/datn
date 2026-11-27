import { destinationRepo } from "@/entities/destination";
import { hotelRepo } from "@/entities/hotel";
import { restaurantRepo } from "@/entities/restaurant";
import { tourRepo } from "@/entities/tour";
import type { ExploreItem, ExploreKind } from "@/features/customer/explore/data";
import {
  toDestinationItem,
  toHotelItem,
  toRestaurantItem,
  toTourItem,
} from "@/features/customer/explore/lib/to-explore-item";
import type { PackagesByKind } from "@/features/customer/landing/lib/package-types";
import { queryScored } from "@/lib/pinecone";
import { buildUserProfile, type UserProfile } from "./profile";

/** Số ứng viên lấy từ Pinecone mỗi loại trước khi chấm điểm lại. */
const CANDIDATES_PER_KIND = 20;
/** Số mục hiển thị mỗi loại. */
const ITEMS_PER_KIND = 4;
/** Trọng số: độ tương đồng sở thích (cosine) và độ gần với giá trung bình đã đặt. */
const SIMILARITY_WEIGHT = 0.7;
const PRICE_WEIGHT = 0.3;

const KINDS: ExploreKind[] = ["tour", "hotel", "restaurant", "destination"];

async function loadItems(kind: ExploreKind, ids: string[]): Promise<ExploreItem[]> {
  switch (kind) {
    case "tour":
      return (await tourRepo.findPublishedByIds(ids)).map(toTourItem);
    case "hotel":
      return (await hotelRepo.findPublishedByIds(ids)).map(toHotelItem);
    case "restaurant":
      return (await restaurantRepo.findPublishedByIds(ids)).map(toRestaurantItem);
    case "destination":
      return (await destinationRepo.findPublishedByIds(ids)).map(toDestinationItem);
  }
}

/** 1 khi giá bằng giá trung bình, giảm dần theo tỉ lệ chênh lệch (rẻ hơn hay đắt hơn gấp đôi đều = 0.5). */
export function priceProximity(price: number, avg: number): number {
  return Math.min(price, avg) / Math.max(price, avg);
}

export function recommendationScore(
  similarity: number,
  price: number | undefined,
  avgPrice: number | undefined,
): number {
  if (!avgPrice || !price) return similarity;
  return (
    SIMILARITY_WEIGHT * similarity +
    PRICE_WEIGHT * priceProximity(price, avgPrice)
  );
}

async function recommendKind(
  kind: ExploreKind,
  profile: UserProfile,
): Promise<ExploreItem[]> {
  const matches = (
    await queryScored(kind, profile.vector, CANDIDATES_PER_KIND)
  ).filter((m) => !profile.excludeIds.has(m.id));
  if (!matches.length) return [];

  const similarity = new Map(matches.map((m) => [m.id, m.score]));
  const items = await loadItems(kind, [...similarity.keys()]);
  return items
    .map((item) => ({
      ...item,
      score: recommendationScore(
        similarity.get(item.id) ?? 0,
        item.price,
        profile.avgPrice[kind],
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, ITEMS_PER_KIND);
}

/**
 * Gợi ý cá nhân hóa theo từng loại dịch vụ.
 * null khi người dùng chưa có lịch sử tìm kiếm/booking hoặc không gọi được Pinecone.
 */
export async function getRecommendations(
  userId: string,
): Promise<PackagesByKind | null> {
  try {
    const profile = await buildUserProfile(userId);
    if (!profile) return null;

    const lists = await Promise.all(KINDS.map((k) => recommendKind(k, profile)));
    if (lists.every((list) => list.length === 0)) return null;
    return Object.fromEntries(
      KINDS.map((kind, i) => [kind, lists[i]]),
    ) as PackagesByKind;
  } catch (error) {
    console.error("getRecommendations:", error);
    return null;
  }
}
