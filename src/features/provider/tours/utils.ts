import type { TourForProvider, TourWithRelations } from "@/entities/tour";
import { TourListItem, ToursSummary } from "./types";
import type {
  ItineraryDay,
  TourFormState,
} from "./components/tour-form";
import { formatEntityCode } from "@/lib/utils";

const FALLBACK_IMAGE = "/image-notfound.png";

export function getToursSummary(tours: TourListItem[]): ToursSummary {
  return {
    total: tours.length,
    published: tours.filter((tour) => tour.status === "published").length,
    inactive: tours.filter((tour) => tour.status === "paused").length,
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

export function mapTourToListItem(tour: TourForProvider): TourListItem {
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
    totalBookings: tour.departures.reduce(
      (total, departure) => total + departure._count.bookings,
      0,
    ),
    rating: null,
    reviewCount: 0,
    status: tour.status,
    deleteScheduledAt: tour.deleteScheduledAt?.toISOString() ?? null,
    activeBookings: tour.departures.reduce(
      (total, departure) => total + departure.bookings.length,
      0,
    ),
  };
}

function toDateInputValue(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function mapTourToFormValues(tour: TourWithRelations): TourFormState {
  const now = new Date();
  const images = Array.isArray(tour.images)
    ? (tour.images as { url?: unknown; fileId?: unknown }[])
    : [];
  const itinerary = Array.isArray(tour.itinerary)
    ? (tour.itinerary as ItineraryDay[])
    : [];

  return {
    title: tour.title,
    provinceId: tour.provinceId,
    tagIds: tour.tags.map((tourTag) => tourTag.tagId),
    durationDays: String(tour.durationDays),
    durationNights: String(tour.durationNights),
    description: tour.description ?? "",
    includeServices: tour.includeServices,
    excludeServices: tour.excludeServices,
    photos: images.flatMap((image) =>
      typeof image?.url === "string" && typeof image?.fileId === "string"
        ? [{ kind: "existing" as const, fileId: image.fileId, previewUrl: image.url }]
        : [],
    ),
    itinerary:
      itinerary.length > 0 ? itinerary : [{ title: "", description: "" }],
    basePrice: String(Number(tour.basePrice)),
    // Đợt đã diễn ra không hiện trong form; server giữ nguyên
    departures: tour.departures
      .filter((departure) => departure.departureDate > now)
      .map((departure) => ({
        id: departure.id,
        bookedSlots: departure.bookedSlots,
        departureDate: toDateInputValue(departure.departureDate),
        returnDate: toDateInputValue(departure.returnDate),
        price: departure.price === null ? "" : String(Number(departure.price)),
        totalSlots: String(departure.totalSlots),
      })),
  };
}
