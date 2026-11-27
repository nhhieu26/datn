import { provinceRepo } from "@/entities/province";
import { searchHistoryRepo } from "@/entities/search-history";
import { ExplorePageContent } from "@/features/customer/explore";
import { loadExplore } from "@/features/customer/explore/lib/load-explore";
import { parseExploreQuery } from "@/features/customer/explore/lib/search-params";
import {
  getQueryEmbedding,
  semanticScores,
} from "@/features/customer/explore/lib/semantic";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { after } from "next/server";

export const metadata: Metadata = {
  title: "Khám phá — Roamly",
  description:
    "Khám phá tour, khách sạn, nhà hàng và điểm đến phù hợp với phong cách du lịch của bạn.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseExploreQuery(await searchParams);
  const [session, vector] = await Promise.all([
    auth(),
    query.q ? getQueryEmbedding(query.q) : null,
  ]);
  const customerId =
    session?.user?.role === "customer" ? session.user.id : undefined;

  const searchExplore = async () => {
    // Pinecone lỗi hoặc không embed được → semantic = null, chỉ tìm theo từ khóa
    const semantic = vector ? await semanticScores(vector) : null;
    return loadExplore(query, semantic);
  };

  const [{ items, total }, provinces, recentSearches] = await Promise.all([
    searchExplore(),
    provinceRepo.findAll(),
    customerId ? searchHistoryRepo.findRecentQueries(customerId) : [],
  ]);

  // Ghi lịch sử sau khi trả trang: chỉ lượt tìm mới (trang 1), không ghi khi chuyển trang
  if (customerId && vector && query.q && query.page === 1) {
    after(() =>
      searchHistoryRepo.record(customerId, query.q, vector).catch((error) => {
        console.error("searchHistory.record:", error);
      }),
    );
  }

  return (
    <ExplorePageContent
      items={items}
      locations={provinces.map((p) => p.name)}
      query={query}
      recentSearches={recentSearches}
      total={total}
    />
  );
}
