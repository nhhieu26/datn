import type { HotelWithRelations } from "@/entities/hotel";
import { formatEntityCode } from "@/lib/utils";
import { HotelListItem, HotelsSummary } from "./types";

const FALLBACK_IMAGE = "/image-notfound.png";

export function getHotelsSummary(hotels: HotelListItem[]): HotelsSummary {
  return {
    total: hotels.length,
    published: hotels.filter((hotel) => hotel.status === "published").length,
    pending: hotels.filter((hotel) => hotel.status === "pending").length,
    inactive: hotels.filter(
      (hotel) => hotel.status === "paused" || hotel.status === "rejected",
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

function findLowestRoomBasePrice(
  rooms: HotelWithRelations["rooms"],
): number | null {
  if (rooms.length === 0) return null;
  return Math.min(...rooms.map((room) => Number(room.basePrice)));
}

function findAverageRoomBasePrice(
  rooms: HotelWithRelations["rooms"],
): number | null {
  if (rooms.length === 0) return null;
  const total = rooms.reduce((sum, room) => sum + Number(room.basePrice), 0);
  return total / rooms.length;
}

export function mapHotelToListItem(hotel: HotelWithRelations): HotelListItem {
  const code = formatEntityCode("HT", hotel.id);

  return {
    id: hotel.id,
    code,
    name: hotel.name,
    description: hotel.description ?? "",
    imageUrl: extractImageUrl(hotel.images),
    provinceName: hotel.province.name,
    address: hotel.address,
    roomCount: hotel.rooms.length,
    totalRoomQuantity: hotel.rooms.reduce((sum, room) => sum + room.quantity, 0),
    lowestRoomPrice: findLowestRoomBasePrice(hotel.rooms),
    averageRoomPrice: findAverageRoomBasePrice(hotel.rooms),
    totalBookings: 0,
    rating: null,
    reviewCount: 0,
    status: hotel.status,
  };
}
