import type { tourRepo } from "@/entities/tour";

type TourRow = NonNullable<
  Awaited<ReturnType<typeof tourRepo.findPublishedDetailBySlug>>
>;

export type TourDetail = {
  title: string;
  location: string;
  description: string;
  images: { url: string }[];
  durationDays: number;
  durationNights: number;
  basePrice: number;
  maxGuests: number;
  includeServices: string[];
  excludeServices: string[];
  itinerary: { title: string; description: string }[];
  departures: {
    id: string;
    /** ISO yyyy-mm-dd */
    date: string;
    price: number;
    slotsLeft: number;
  }[];
};

// Prisma Decimal/Date không truyền được sang Client Component → map sang kiểu thuần
export function toTourDetail(t: TourRow): TourDetail {
  const departures = t.departures.map((d) => ({
    id: d.id,
    date: d.departureDate.toISOString().slice(0, 10),
    price: Number(d.price ?? t.basePrice),
    slotsLeft: Math.max(0, d.totalSlots - d.bookedSlots),
  }));
  const images = (t.images as { url: string }[] | null) ?? [];
  return {
    title: t.title,
    location: t.province.name,
    description: t.description ?? "",
    images: images.length ? images : [{ url: "/image-notfound.png" }],
    durationDays: t.durationDays,
    durationNights: t.durationNights,
    basePrice: Number(t.basePrice),
    maxGuests: Math.max(0, ...departures.map((d) => d.slotsLeft)),
    includeServices: t.includeServices,
    excludeServices: t.excludeServices,
    itinerary: (t.itinerary as { title: string; description: string }[]) ?? [],
    departures,
  };
}
