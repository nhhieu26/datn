import type { ProvinceWithUsage } from "@/entities/province";
import type { TagWithUsage } from "@/entities/tag";
import type { AdminProvinceItem, AdminTagItem, UsageCounts } from "./types";

function toUsageCounts(count: {
  tours: number;
  hotels: number;
  restaurants: number;
  destinations: number;
}): UsageCounts {
  return {
    tours: count.tours,
    hotels: count.hotels,
    restaurants: count.restaurants,
    destinations: count.destinations,
    total:
      count.tours + count.hotels + count.restaurants + count.destinations,
  };
}

export function mapTagToAdminItem(tag: TagWithUsage): AdminTagItem {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
    counts: toUsageCounts(tag._count),
  };
}

export function mapProvinceToAdminItem(
  province: ProvinceWithUsage,
): AdminProvinceItem {
  return {
    id: province.id,
    name: province.name,
    fullName: province.fullName,
    slug: province.slug,
    type: province.type,
    imageUrl: province.imageUrl,
    createdAt: province.createdAt.toISOString(),
    updatedAt: province.updatedAt.toISOString(),
    counts: toUsageCounts(province._count),
  };
}
