import type {
  RestaurantForProviderList,
  RestaurantWithRelations,
} from "@/entities/restaurant";
import { formatEntityCode } from "@/lib/utils";
import type { RestaurantListItem, RestaurantsSummary } from "./types";
import type { RestaurantFormState } from "./components/restaurant-form";

const FALLBACK_IMAGE = "/image-notfound.png";

export function getRestaurantsSummary(
  restaurants: RestaurantListItem[]
): RestaurantsSummary {
  return {
    total: restaurants.length,
    published: restaurants.filter(
      (restaurant) => restaurant.status === "published"
    ).length,
    inactive: restaurants.filter(
      (restaurant) => restaurant.status === "paused"
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
  restaurant: RestaurantForProviderList
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
    totalBookings: restaurant._count.bookings,
    status: restaurant.status,
    deleteScheduledAt: restaurant.deleteScheduledAt?.toISOString() ?? null,
    activeBookings: restaurant.bookings.length,
  };
}

export function mapRestaurantToFormValues(
  restaurant: RestaurantWithRelations
): RestaurantFormState {
  const images = Array.isArray(restaurant.images)
    ? (restaurant.images as { url?: unknown; fileId?: unknown }[])
    : [];
  const menu = Array.isArray(restaurant.menu)
    ? (restaurant.menu as {
        name?: unknown;
        description?: unknown;
        price?: unknown;
      }[])
    : [];

  return {
    name: restaurant.name,
    provinceId: restaurant.provinceId,
    address: restaurant.address,
    location:
      restaurant.latitude === null || restaurant.longitude === null
        ? null
        : {
            lat: Number(restaurant.latitude),
            lng: Number(restaurant.longitude),
          },
    phone: restaurant.phone ?? "",
    capacity: String(restaurant.capacity),
    description: restaurant.description ?? "",
    tagIds: restaurant.tags.map((item) => item.tagId),
    photos: images.flatMap((image) =>
      typeof image?.url === "string" && typeof image?.fileId === "string"
        ? [
            {
              kind: "existing" as const,
              fileId: image.fileId,
              previewUrl: image.url,
            },
          ]
        : []
    ),
    menu: menu.map((item) => {
      const price = Number(item.price);
      return {
        name: typeof item.name === "string" ? item.name : "",
        description: typeof item.description === "string" ? item.description : "",
        price: Number.isFinite(price) ? String(price) : "",
      };
    }),
    timeSlots: restaurant.timeSlots
      .map((slot) => ({ startTime: slot.startTime, endTime: slot.endTime }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  };
}
