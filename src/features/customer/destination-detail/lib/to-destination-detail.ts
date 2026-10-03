import type { destinationRepo } from "@/entities/destination";

type DestinationRow = NonNullable<
  Awaited<ReturnType<typeof destinationRepo.findPublishedDetailBySlug>>
>;

type Img = { url: string };

export type DestinationDetail = {
  name: string;
  location: string;
  address: string;
  description: string;
  images: Img[];
  tags: string[];
  latitude: number | null;
  longitude: number | null;
  ticketPrice: number | null;
};

const FALLBACK: Img[] = [{ url: "/image-notfound.png" }];

// Prisma Decimal không truyền được sang Client Component → map sang kiểu thuần
export function toDestinationDetail(d: DestinationRow): DestinationDetail {
  const images = (d.images as Img[] | null) ?? [];
  return {
    name: d.name,
    location: d.province.name,
    address: d.address,
    description: d.description ?? "",
    images: images.length ? images : FALLBACK,
    tags: d.tags.map((t) => t.tag.name),
    latitude: d.latitude == null ? null : Number(d.latitude),
    longitude: d.longitude == null ? null : Number(d.longitude),
    ticketPrice: d.ticketPrice == null ? null : Number(d.ticketPrice),
  };
}
