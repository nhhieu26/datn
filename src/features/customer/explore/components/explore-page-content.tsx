import Link from "next/link";
import { ExploreResults } from "./explore-results";
import { FilterSidebar } from "./filter-sidebar";

export function ExplorePageContent() {
  return (
    <div className="font-[family-name:var(--font-dm-sans)] text-new-paragraph">
      <section className="bg-new-banner-bg py-10 page-x">
        <div className="w-full">
          <h1 className="text-[30px] leading-[1.1] font-bold capitalize mb-1.5 text-new-title">
            Khám phá
          </h1>
          <nav aria-label="breadcrumb">
            <ul className="flex items-center font-[family-name:var(--font-kaushan)] text-sm leading-[1.4]">
              <li>
                <Link className="text-new-title" href="/">
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <span
                  aria-hidden
                  className="material-symbols-outlined text-base px-2 text-new-title"
                >
                  remove
                </span>
                <span className="text-new-coral">Khám phá</span>
              </li>
            </ul>
          </nav>
        </div>
      </section>

      <section className="py-[70px] page-x">
        <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-6">
          <FilterSidebar />
          <ExploreResults />
        </div>
      </section>
    </div>
  );
}
