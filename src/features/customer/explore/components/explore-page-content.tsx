import { PageBanner } from "@/features/customer/components/page-banner";
import type { ExploreItem } from "../data";
import type { ExploreQuery } from "../lib/search-params";
import { ExploreResults } from "./explore-results";
import { FilterSidebar } from "./filter-sidebar";

type ExplorePageContentProps = {
  items: ExploreItem[];
  total: number;
  query: ExploreQuery;
  locations: string[];
};

export function ExplorePageContent({
  items,
  total,
  query,
  locations,
}: ExplorePageContentProps) {
  return (
    <div className="font-[family-name:var(--font-dm-sans)] text-new-paragraph">
      <PageBanner
        items={[{ label: "Trang chủ", href: "/" }, { label: "Khám phá" }]}
        title="Khám phá"
      />

      <section className="py-[70px] page-x">
        <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-6">
          <FilterSidebar locations={locations} query={query} />
          <ExploreResults items={items} query={query} total={total} />
        </div>
      </section>
    </div>
  );
}
