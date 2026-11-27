import { firstImage } from "@/features/customer/components/cards/card-parts";
import { embedText } from "@/lib/gemini";
import { queryTourEmbeddings } from "@/lib/pinecone";
import { prisma } from "@/lib/prisma";

const LIMIT = 5;
// Điểm cosine của gemini-embedding-001 rất sát nhau: tour đúng nhu cầu ~0.67-0.74, tour không liên quan
// ~0.58-0.65 (vd "chùa Hải Dương" → tour Bái Đính 0.653). Đo trên dữ liệu tour hiện tại.
const MIN_SCORE = 0.66;

export type TourSearchInput = {
  query: string;
  province?: string;
  maxPrice?: number;
  days?: number;
};

/** null khi không gọi được Pinecone (khi đó lọc bằng điều kiện); [] khi không có tour nào đủ liên quan. */
async function semanticIds(query: string): Promise<string[] | null> {
  try {
    return await queryTourEmbeddings(await embedText(query), 20, undefined, MIN_SCORE);
  } catch (error) {
    console.error("searchTours:", error);
    return null;
  }
}

/** Tìm tour Roamly: Pinecone xếp hạng theo ngữ nghĩa, Prisma lọc điều kiện. */
export async function searchTours({ query, province, maxPrice, days }: TourSearchInput) {
  const ids = await semanticIds(query);
  if (ids?.length === 0) return [];

  const tours = await prisma.tour.findMany({
    where: {
      status: "published",
      deletedAt: null,
      deleteScheduledAt: null,
      ...(ids && { id: { in: ids } }),
      ...(province && { province: { name: { contains: province, mode: "insensitive" } } }),
      ...(maxPrice && { basePrice: { lte: maxPrice } }),
      ...(days && { durationDays: days }),
    },
    orderBy: { ratingAvg: "desc" },
    take: ids ? undefined : LIMIT,
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

  const rank = new Map(ids?.map((id, i) => [id, i]));
  if (ids) tours.sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);

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
