import type { TourWithRelations } from "@/entities/tour";
import type { TourListItem } from "./mock-data";

const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCXSk5PTysU3Sjo7Su5I8eJg_cWR-089y-SyD1w3ABaxYMxyDP6KgpxlPxFXUTkZTniN1jjC92DKfydxZ9rDARlAlvK2u_BoiWonq8JVerK8BqxPHAEKkw5RdauYz5U_YQjre4CCkEis50GIGxtHACko2G2zABMpeH5_A68lQ5xE18KuV2V7PpDu5fZ6x-dHw6cAFM-85Wgn6lVjvr4QCNlBMtXb4Qhq1Y4VW3JNTPB4ZsykqzZSdAS";

function extractImageUrl(images: unknown): string {
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0] as { url?: unknown };
    if (typeof first?.url === "string") return first.url;
  }
  return FALLBACK_IMAGE;
}

function findNearestScheduledDeparture(
  departures: TourWithRelations["departures"]
): string | null {
  const now = new Date();
  const upcoming = departures
    .filter(
      (departure) =>
        departure.status === "scheduled" && departure.departureDate >= now
    )
    .sort((a, b) => a.departureDate.getTime() - b.departureDate.getTime());
  return upcoming.length > 0 ? upcoming[0].departureDate.toISOString() : null;
}

export function mapTourToListItem(tour: TourWithRelations): TourListItem {
  const code = `TR-${tour.id.slice(-8).toUpperCase()}`;
  const category =
    tour.tags.map((tourTag) => tourTag.tag.name).join(", ") ||
    "Chưa phân loại";

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
