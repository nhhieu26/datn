import { provinceRepo } from "@/entities/province";
import { ExplorePageContent } from "@/features/customer/explore";
import { loadExplore } from "@/features/customer/explore/lib/load-explore";
import { parseExploreQuery } from "@/features/customer/explore/lib/search-params";
import type { Metadata } from "next";

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
  const [{ items, total }, provinces] = await Promise.all([
    loadExplore(query),
    provinceRepo.findAll(),
  ]);

  return (
    <ExplorePageContent
      items={items}
      locations={provinces.map((p) => p.name)}
      query={query}
      total={total}
    />
  );
}
