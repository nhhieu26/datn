import type { TourWithRelations } from "@/entities/tour";
import { TourListItem, ToursSummary } from "./types";
import { formatEntityCode } from "@/lib/utils";

const FALLBACK_IMAGE = "/image-notfound.png";

export function getToursSummary(tours: TourListItem[]): ToursSummary {
  return {
    total: tours.length,
    published: tours.filter((tour) => tour.status === "published").length,
    pending: tours.filter((tour) => tour.status === "pending").length,
    inactive: tours.filter(
      (tour) => tour.status === "paused" || tour.status === "rejected",
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

function findNearestScheduledDeparture(
  departures: TourWithRelations["departures"],
): string | null {
  const now = new Date();
  const upcoming = departures
    .filter(
      (departure) =>
        departure.status === "scheduled" && departure.departureDate >= now,
    )
    .sort((a, b) => a.departureDate.getTime() - b.departureDate.getTime());
  return upcoming.length > 0 ? upcoming[0].departureDate.toISOString() : null;
}

export function mapTourToListItem(tour: TourWithRelations): TourListItem {
  const code = formatEntityCode("TR", tour.id);
  const category =
    tour.tags.map((tourTag) => tourTag.tag.name).join(", ") || "Chưa phân loại";

  return {
    id: tour.id,
    code,
    title: tour.title,
    description: tour.description ?? "",
    imageUrl: extractImageUrl(tour.images),
    category,
    provinceName: tour.province.name,
    durationDays: tour.durationDays,
    durationNights: tour.durationNights,
    basePrice: Number(tour.basePrice),
    nearestDepartureDate: findNearestScheduledDeparture(tour.departures),
    totalBookings: 0,
    rating: null,
    reviewCount: 0,
    status: tour.status,
  };
}
