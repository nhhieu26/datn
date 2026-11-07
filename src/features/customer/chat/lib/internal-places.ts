import { menuAveragePrice } from "@/entities/list-filter";
import { firstImage } from "@/features/customer/components/cards/card-parts";
import { embedText } from "@/lib/gemini";
import {
  queryDestinationEmbeddings,
  queryHotelEmbeddings,
  queryRestaurantEmbeddings,
} from "@/lib/pinecone";
import { prisma } from "@/lib/prisma";
import { num, truncate } from "./format";

const PINECONE_TOP_K = 20;

// semantic: khớp ngữ nghĩa với yêu cầu; popular: chỉ là dịch vụ nổi bật cùng khu vực (fallback)
const matchedBy = (index: number, semanticCount: number) =>
  index < semanticCount ? ("semantic" as const) : ("popular" as const);

// Chỉ lấy dịch vụ đang mở bán, chưa bị xóa/lên lịch xóa
export const liveService = {
  status: "published" as const,
  deletedAt: null,
  deleteScheduledAt: null,
};

export async function resolveLocation(province?: string): Promise<{
  provinceIds: string[];
  subLocation?: string;
}> {
  const trimmed = province?.trim();
  if (!trimmed) return { provinceIds: [] };

  const matched = await prisma.province.findMany({
    where: {
      OR: [
        { name: { contains: trimmed, mode: "insensitive" } },
        { fullName: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    select: { id: true },
  });

  if (matched.length > 0) {
    return { provinceIds: matched.map((p) => p.id) };
  }

  // Trường hợp người dùng nhập địa danh con (vd: Cát Bà, Tràng An, Tam Cốc, Đà Lạt...)
  return { provinceIds: [], subLocation: trimmed };
}

export function buildSemanticText(parts: (string | string[] | undefined)[]): string {
  return parts
    .flatMap((p) => (Array.isArray(p) ? p : p ? [p] : []))
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
}

export async function getSemanticIds(
  semanticText: string,
  queryFn: (
    vector: number[],
    topK: number,
    provinceIds?: string[],
  ) => Promise<string[]>,
  provinceIds?: string[],
): Promise<string[]> {
  if (!semanticText) return [];
  try {
    const vector = await embedText(semanticText);
    return await queryFn(vector, PINECONE_TOP_K, provinceIds);
  } catch (error) {
    console.warn("Semantic search fallback sang Prisma:", error);
    return [];
  }
}

export function sortBySemanticOrder<T extends { id: string }>(
  items: T[],
  semanticIds: string[],
): T[] {
  const rank = new Map(semanticIds.map((id, idx) => [id, idx]));
  return [...items].sort(
    (a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity),
  );
}

// Lọc theo địa danh con (không khớp tỉnh) trên tên, địa chỉ, mô tả
const subLocationWhere = (subLocation: string | undefined) => {
  if (!subLocation) return {};
  const match = { contains: subLocation, mode: "insensitive" as const };
  return { OR: [{ name: match }, { address: match }, { description: match }] };
};

type MenuDish = { name: string; price: number | null; description: string | null };

function parseMenuDishes(raw: unknown, maxItems = 5): MenuDish[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is { name?: unknown; price?: unknown; description?: unknown } =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as { name?: unknown }).name === "string",
    )
    .slice(0, maxItems)
    .map((item) => ({
      name: String(item.name),
      price:
        typeof item.price === "number" && Number.isFinite(item.price)
          ? item.price
          : null,
      description:
        typeof item.description === "string"
          ? truncate(item.description, 120)
          : null,
    }));
}

const hotelSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  images: true,
  address: true,
  latitude: true,
  longitude: true,
  amenities: true,
  ratingAvg: true,
  reviewCount: true,
  province: { select: { name: true } },
  tags: { select: { tag: { select: { name: true } } } },
  rooms: {
    where: { status: "published" as const },
    orderBy: { basePrice: "asc" as const },
    take: 3,
    select: {
      name: true,
      capacity: true,
      basePrice: true,
      amenities: true,
    },
  },
} as const;

const restaurantSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  images: true,
  address: true,
  latitude: true,
  longitude: true,
  capacity: true,
  menu: true,
  ratingAvg: true,
  reviewCount: true,
  province: { select: { name: true } },
  tags: { select: { tag: { select: { name: true } } } },
  timeSlots: {
    select: { startTime: true, endTime: true },
  },
} as const;

const destinationSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  images: true,
  address: true,
  latitude: true,
  longitude: true,
  openTime: true,
  closeTime: true,
  ticketPrice: true,
  province: { select: { name: true } },
  tags: { select: { tag: { select: { name: true } } } },
} as const;

export type InternalSearchInput = {
  query?: string;
  province?: string;
  tags?: string[];
  limit: number;
};

export async function searchInternalHotels({
  query,
  province,
  tags,
  amenities,
  maxPrice,
  limit,
}: InternalSearchInput & { amenities?: string[]; maxPrice?: number }) {
  const { provinceIds, subLocation } = await resolveLocation(province);
  const semanticText = buildSemanticText([
    query,
    subLocation,
    tags,
    amenities,
    province,
  ]);
  const semanticIds = await getSemanticIds(
    semanticText,
    queryHotelEmbeddings,
    provinceIds,
  );

  const baseWhere = {
    ...liveService,
    ...(provinceIds.length > 0 ? { provinceId: { in: provinceIds } } : {}),
    ...subLocationWhere(subLocation),
    rooms: {
      some: {
        status: "published" as const,
        ...(maxPrice ? { basePrice: { lte: maxPrice } } : {}),
      },
    },
  };

  let results: Awaited<
    ReturnType<typeof prisma.hotel.findMany<{ select: typeof hotelSelect }>>
  > = [];

  if (semanticIds.length > 0) {
    const vectorMatches = await prisma.hotel.findMany({
      where: { ...baseWhere, id: { in: semanticIds } },
      select: hotelSelect,
    });
    results = sortBySemanticOrder(vectorMatches, semanticIds).slice(0, limit);
  }

  const semanticCount = results.length;
  if (results.length < limit) {
    const excludeIds = results.map((r) => r.id);
    const fallback = await prisma.hotel.findMany({
      where: {
        ...baseWhere,
        ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
      },
      orderBy: [{ ratingAvg: "desc" }, { reviewCount: "desc" }],
      take: limit - results.length,
      select: hotelSelect,
    });
    results = [...results, ...fallback];
  }

  return results.map((h, i) => ({
    source: "internal" as const,
    kind: "hotel" as const,
    id: h.id,
    matchedBy: matchedBy(i, semanticCount),
    name: h.name,
    url: `/hotels/${h.slug}`,
    image: firstImage(h.images),
    province: h.province.name,
    address: h.address,
    latitude: num(h.latitude),
    longitude: num(h.longitude),
    amenities: h.amenities,
    priceFrom: num(h.rooms[0]?.basePrice),
    rating: num(h.ratingAvg),
    reviewCount: h.reviewCount,
    tags: h.tags.map((x) => x.tag.name),
    description: truncate(h.description, 280),
    rooms: h.rooms.map((r) => ({
      name: r.name,
      capacity: r.capacity,
      price: num(r.basePrice),
      amenities: r.amenities.slice(0, 4),
    })),
  }));
}

export async function searchInternalRestaurants({
  query,
  province,
  tags,
  limit,
}: InternalSearchInput) {
  const { provinceIds, subLocation } = await resolveLocation(province);
  const semanticText = buildSemanticText([query, subLocation, tags, province]);
  const semanticIds = await getSemanticIds(
    semanticText,
    queryRestaurantEmbeddings,
    provinceIds,
  );

  const baseWhere = {
    ...liveService,
    ...(provinceIds.length > 0 ? { provinceId: { in: provinceIds } } : {}),
    ...subLocationWhere(subLocation),
  };

  let results: Awaited<
    ReturnType<
      typeof prisma.restaurant.findMany<{ select: typeof restaurantSelect }>
    >
  > = [];

  if (semanticIds.length > 0) {
    const vectorMatches = await prisma.restaurant.findMany({
      where: { ...baseWhere, id: { in: semanticIds } },
      select: restaurantSelect,
    });
    results = sortBySemanticOrder(vectorMatches, semanticIds).slice(0, limit);
  }

  const semanticCount = results.length;
  if (results.length < limit) {
    const excludeIds = results.map((r) => r.id);
    const fallback = await prisma.restaurant.findMany({
      where: {
        ...baseWhere,
        ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
      },
      orderBy: [{ ratingAvg: "desc" }, { reviewCount: "desc" }],
      take: limit - results.length,
      select: restaurantSelect,
    });
    results = [...results, ...fallback];
  }

  return results.map((r, i) => {
    const starts = r.timeSlots.map((s) => s.startTime).sort();
    const ends = r.timeSlots.map((s) => s.endTime).sort();
    const hours = starts.length ? `${starts[0]} - ${ends[ends.length - 1]}` : null;
    return {
      source: "internal" as const,
      kind: "restaurant" as const,
      id: r.id,
      matchedBy: matchedBy(i, semanticCount),
      name: r.name,
      url: `/restaurants/${r.slug}`,
      image: firstImage(r.images),
      province: r.province.name,
      address: r.address,
      latitude: num(r.latitude),
      longitude: num(r.longitude),
      capacity: r.capacity,
      hours,
      avgPrice: menuAveragePrice(r.menu) ?? null,
      rating: num(r.ratingAvg),
      reviewCount: r.reviewCount,
      tags: r.tags.map((x) => x.tag.name),
      description: truncate(r.description, 280),
      dishes: parseMenuDishes(r.menu, 5),
    };
  });
}

export async function searchInternalDestinations({
  query,
  province,
  tags,
  limit,
}: InternalSearchInput) {
  const { provinceIds, subLocation } = await resolveLocation(province);
  const semanticText = buildSemanticText([query, subLocation, tags, province]);
  const semanticIds = await getSemanticIds(
    semanticText,
    queryDestinationEmbeddings,
    provinceIds,
  );

  const baseWhere = {
    isPublished: true,
    ...(provinceIds.length > 0 ? { provinceId: { in: provinceIds } } : {}),
    ...subLocationWhere(subLocation),
  };

  let results: Awaited<
    ReturnType<
      typeof prisma.destination.findMany<{ select: typeof destinationSelect }>
    >
  > = [];

  if (semanticIds.length > 0) {
    const vectorMatches = await prisma.destination.findMany({
      where: { ...baseWhere, id: { in: semanticIds } },
      select: destinationSelect,
    });
    results = sortBySemanticOrder(vectorMatches, semanticIds).slice(0, limit);
  }

  const semanticCount = results.length;
  if (results.length < limit) {
    const excludeIds = results.map((r) => r.id);
    const fallback = await prisma.destination.findMany({
      where: {
        ...baseWhere,
        ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit - results.length,
      select: destinationSelect,
    });
    results = [...results, ...fallback];
  }

  return results.map((d, i) => ({
    source: "internal" as const,
    kind: "destination" as const,
    id: d.id,
    matchedBy: matchedBy(i, semanticCount),
    name: d.name,
    url: `/destinations/${d.slug}`,
    image: firstImage(d.images),
    province: d.province.name,
    address: d.address,
    latitude: num(d.latitude),
    longitude: num(d.longitude),
    hours: `${d.openTime} - ${d.closeTime}`,
    ticketPrice: num(d.ticketPrice),
    tags: d.tags.map((x) => x.tag.name),
    description: truncate(d.description, 300),
  }));
}
