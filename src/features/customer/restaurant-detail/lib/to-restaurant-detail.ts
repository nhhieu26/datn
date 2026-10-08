import type { restaurantRepo } from "@/entities/restaurant";
import type {
  RestaurantDetail,
  RestaurantMenuItem,
} from "./restaurant-detail";

type RestaurantRow = NonNullable<
  Awaited<ReturnType<typeof restaurantRepo.findPublishedDetailBySlug>>
>;

type Img = { url: string };

const FALLBACK: Img[] = [{ url: "/image-notfound.png" }];

// Prisma Decimal không truyền được sang Client Component → map sang kiểu thuần
export function toRestaurantDetail(r: RestaurantRow): RestaurantDetail {
  const images = (r.images as Img[] | null) ?? [];
  const menu = ((r.menu as Partial<RestaurantMenuItem>[] | null) ?? [])
    .map((m) => ({
      name: m.name ?? "",
      description: m.description ?? "",
      price: Number(m.price),
    }))
    .filter((m) => Number.isFinite(m.price));
  return {
    id: r.id,
    rating: { avg: Number(r.ratingAvg), count: r.reviewCount },
    name: r.name,
    slug: r.slug,
    location: r.province.name,
    address: r.address,
    phone: r.phone,
    latitude: r.latitude == null ? null : Number(r.latitude),
    longitude: r.longitude == null ? null : Number(r.longitude),
    description: r.description ?? "",
    capacity: r.capacity,
    images: images.length ? images : FALLBACK,
    menu,
    tags: r.tags.map((t) => t.tag.name),
    timeSlots: r.timeSlots.map((s) => ({
      startTime: s.startTime,
      endTime: s.endTime,
    })),
  };
}
