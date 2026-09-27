import type { DestinationWithRelations } from "@/entities/destination";
import { formatEntityCode } from "@/lib/utils";
import type { DestinationListItem, DestinationsSummary } from "./types";

const FALLBACK_IMAGE = "/image-notfound.png";

function extractImageUrl(images: unknown): string {
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0] as { url?: unknown };
    if (typeof first?.url === "string") return first.url;
  }
  return FALLBACK_IMAGE;
}

export function mapDestinationToListItem(
  destination: DestinationWithRelations
): DestinationListItem {
  return {
    id: destination.id,
    code: formatEntityCode("DE", destination.id),
    name: destination.name,
    description: destination.description ?? "",
    imageUrl: extractImageUrl(destination.images),
    provinceName: destination.province.fullName,
    address: destination.address,
    category:
      destination.tags.map((destinationTag) => destinationTag.tag.name).join(", ") ||
      "Chưa phân loại",
    ticketPrice:
      destination.ticketPrice === null ? null : Number(destination.ticketPrice),
    isPublished: destination.isPublished,
    createdAt: destination.createdAt.toISOString(),
  };
}

export function getDestinationsSummary(
  destinations: DestinationListItem[]
): DestinationsSummary {
  return {
    total: destinations.length,
    published: destinations.filter((item) => item.isPublished).length,
    draft: destinations.filter((item) => !item.isPublished).length,
  };
}
