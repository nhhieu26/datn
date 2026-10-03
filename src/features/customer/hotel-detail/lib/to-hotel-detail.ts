import type { hotelRepo } from "@/entities/hotel";

type HotelRow = NonNullable<
  Awaited<ReturnType<typeof hotelRepo.findPublishedDetailBySlug>>
>;

type Img = { url: string };

export type HotelRoom = {
  id: string;
  name: string;
  description: string;
  images: Img[];
  capacity: number;
  quantity: number;
  basePrice: number;
  amenities: string[];
};

export type HotelDetail = {
  name: string;
  location: string;
  address: string;
  description: string;
  images: Img[];
  amenities: string[];
  tags: string[];
  latitude: number | null;
  longitude: number | null;
  minPrice: number;
  maxCapacity: number;
  rooms: HotelRoom[];
};

const FALLBACK: Img[] = [{ url: "/image-notfound.png" }];

// Prisma Decimal không truyền được sang Client Component → map sang kiểu thuần
export function toHotelDetail(h: HotelRow): HotelDetail {
  const rooms = h.rooms.map((r) => {
    const imgs = (r.images as Img[] | null) ?? [];
    return {
      id: r.id,
      name: r.name,
      description: r.description ?? "",
      images: imgs.length ? imgs : FALLBACK,
      capacity: r.capacity,
      quantity: r.quantity,
      basePrice: Number(r.basePrice),
      amenities: r.amenities,
    };
  });
  const images = (h.images as Img[] | null) ?? [];
  return {
    name: h.name,
    location: h.province.name,
    address: h.address,
    description: h.description ?? "",
    images: images.length ? images : FALLBACK,
    amenities: h.amenities,
    tags: h.tags.map((t) => t.tag.name),
    latitude: h.latitude == null ? null : Number(h.latitude),
    longitude: h.longitude == null ? null : Number(h.longitude),
    minPrice: rooms.length ? Math.min(...rooms.map((r) => r.basePrice)) : 0,
    maxCapacity: Math.max(0, ...rooms.map((r) => r.capacity)),
    rooms,
  };
}
