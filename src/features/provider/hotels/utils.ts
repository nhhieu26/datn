import type {
  HotelForProvider,
  HotelForProviderList,
  HotelWithRelations,
} from "@/entities/hotel";
import { formatEntityCode } from "@/lib/utils";
import { HotelListItem, HotelsSummary } from "./types";
import type {
  HotelFormState,
  HotelPhoto,
  RoomDraft,
} from "./components/hotel-form";

const FALLBACK_IMAGE = "/image-notfound.png";

export function getHotelsSummary(hotels: HotelListItem[]): HotelsSummary {
  return {
    total: hotels.length,
    published: hotels.filter((hotel) => hotel.status === "published").length,
    inactive: hotels.filter((hotel) => hotel.status === "paused").length,
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

export function mapHotelToListItem(hotel: HotelForProviderList): HotelListItem {
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
    tagNames: hotel.tags.map((item) => item.tag.name),
    totalBookings: hotel.rooms.reduce(
      (total, room) => total + room._count.bookings,
      0,
    ),
    rating: null,
    reviewCount: 0,
    status: hotel.status,
    deleteScheduledAt: hotel.deleteScheduledAt?.toISOString() ?? null,
    activeBookings: hotel.rooms.reduce(
      (total, room) => total + room.bookings.length,
      0,
    ),
  };
}

function toExistingPhotos(images: unknown): HotelPhoto[] {
  if (!Array.isArray(images)) return [];
  return images.flatMap((image) =>
    typeof image?.url === "string" && typeof image?.fileId === "string"
      ? [
          {
            kind: "existing" as const,
            fileId: image.fileId,
            previewUrl: image.url,
          },
        ]
      : [],
  );
}

export function mapHotelToFormValues(hotel: HotelForProvider): HotelFormState {
  return {
    name: hotel.name,
    provinceId: hotel.provinceId,
    address: hotel.address,
    location:
      hotel.latitude !== null && hotel.longitude !== null
        ? { lat: Number(hotel.latitude), lng: Number(hotel.longitude) }
        : null,
    description: hotel.description ?? "",
    amenities: hotel.amenities,
    tagIds: hotel.tags.map((item) => item.tagId),
    photos: toExistingPhotos(hotel.images),
    rooms: hotel.rooms.map((room): RoomDraft => ({
      id: room.id,
      bookedCount: room._count.bookings,
      name: room.name,
      description: room.description ?? "",
      capacity: String(room.capacity),
      quantity: String(room.quantity),
      basePrice: String(Number(room.basePrice)),
      amenities: room.amenities,
      photos: toExistingPhotos(room.images),
    })),
  };
}
