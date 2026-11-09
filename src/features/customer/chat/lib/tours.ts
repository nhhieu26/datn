import { firstImage } from "@/features/customer/components/cards/card-parts";
import { embedText } from "@/lib/gemini";
import { queryTourEmbeddings } from "@/lib/pinecone";
import { prisma } from "@/lib/prisma";

const LIMIT = 5;

export type TourSearchInput = {
  query: string;
  province?: string;
  maxPrice?: number;
  days?: number;
};

async function semanticIds(query: string): Promise<string[]> {
  try {
    return await queryTourEmbeddings(await embedText(query), 20);
  } catch {
    return [];
  }
}

/** Tìm tour Roamly: Pinecone xếp hạng theo ngữ nghĩa, Prisma lọc điều kiện. */
export async function searchTours({ query, province, maxPrice, days }: TourSearchInput) {
  const ids = await semanticIds(query);

  const tours = await prisma.tour.findMany({
    where: {
      status: "published",
      deletedAt: null,
      deleteScheduledAt: null,
      ...(ids.length > 0 && { id: { in: ids } }),
      ...(province && { province: { name: { contains: province, mode: "insensitive" } } }),
      ...(maxPrice && { basePrice: { lte: maxPrice } }),
      ...(days && { durationDays: days }),
    },
    orderBy: { ratingAvg: "desc" },
    take: ids.length > 0 ? undefined : LIMIT,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      images: true,
      itinerary: true,
      durationDays: true,
      durationNights: true,
      basePrice: true,
      ratingAvg: true,
      reviewCount: true,
      province: { select: { name: true } },
    },
  });

  const rank = new Map(ids.map((id, i) => [id, i]));
  if (ids.length > 0) tours.sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);

  return tours.slice(0, LIMIT).map((t) => ({
    title: t.title,
    url: `/tours/${t.slug}`,
    image: firstImage(t.images),
    province: t.province.name,
    duration: `${t.durationDays}N${t.durationNights}Đ`,
    price: Number(t.basePrice),
    rating: Number(t.ratingAvg),
    reviewCount: t.reviewCount,
    description: t.description?.slice(0, 300) ?? null,
    itinerary: t.itinerary,
  }));
}
