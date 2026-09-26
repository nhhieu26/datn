import type { RestaurantWithRelations } from "@/entities/restaurant";
import { formatEntityCode } from "@/lib/utils";
import type { RestaurantListItem, RestaurantsSummary } from "./types";

const FALLBACK_IMAGE = "/image-notfound.png";

export function getRestaurantsSummary(
  restaurants: RestaurantListItem[]
): RestaurantsSummary {
  return {
    total: restaurants.length,
    published: restaurants.filter(
      (restaurant) => restaurant.status === "published"
    ).length,
    pending: restaurants.filter(
      (restaurant) => restaurant.status === "pending"
    ).length,
    inactive: restaurants.filter(
      (restaurant) =>
        restaurant.status === "paused" || restaurant.status === "rejected"
    ).length,
  };
}

function extractImageUrl(images: unknown): string {
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0] as { url?: unknown };
    if (typeof first?.url === "string") return first.url;
  }
  return FALLBACK_IMAGE;
}

function extractMenuItems(menu: unknown): { name?: unknown; price?: unknown }[] {
  return Array.isArray(menu) ? (menu as { name?: unknown; price?: unknown }[]) : [];
}

function findLowestMenuPrice(menu: unknown): number | null {
  const prices = extractMenuItems(menu)
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price));
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

export function mapRestaurantToListItem(
  restaurant: RestaurantWithRelations
): RestaurantListItem {
  const menuItems = extractMenuItems(restaurant.menu);

  return {
    id: restaurant.id,
    code: formatEntityCode("RS", restaurant.id),
    name: restaurant.name,
    description: restaurant.description ?? "",
    imageUrl: extractImageUrl(restaurant.images),
    provinceName: restaurant.province.name,
    address: restaurant.address,
    capacity: restaurant.capacity,
    menuItemCount: menuItems.length,
    lowestMenuPrice: findLowestMenuPrice(restaurant.menu),
    tagNames: restaurant.tags.map((item) => item.tag.name),
    status: restaurant.status,
  };
}
