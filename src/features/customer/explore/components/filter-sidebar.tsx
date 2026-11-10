"use client";

import { FadeIn } from "@/features/customer/components/motion";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LocationPicker } from "../../components/location-picker";
import { KIND_FILTERS } from "../data";
import { buildExploreUrl, type ExploreQuery } from "../lib/search-params";
import { PriceRangeSlider } from "./price-range-slider";

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span aria-hidden className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  );
}

function Heading({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 pt-[30px] pb-4 border-b border-new-chip">
      <Icon className="text-[26px] text-new-title" name={icon} />
      <h4 className="text-lg xl:text-xl font-bold leading-[1.4] text-new-title">
        {title}
      </h4>
    </div>
  );
}

type FilterSidebarProps = { locations: string[]; query: ExploreQuery };

export function FilterSidebar({ locations, query }: FilterSidebarProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(query.q);

  function apply(patch: Partial<ExploreQuery> = {}) {
    router.push(buildExploreUrl(query, patch));
  }

  return (
    <FadeIn className="xl:col-span-3" duration={0.45} inView={false} x={-16} y={8}>
      <aside>
        <div className="rounded-lg border border-new-chip px-5 pb-[30px]">
          <Heading icon="tune" title="Bộ lọc tìm kiếm" />

          <div className="mt-5">
            <form
              className="mb-3 flex items-center gap-2.5 rounded-lg border border-new-chip px-4 py-3 transition-colors focus-within:border-new-teal-cta"
              onSubmit={(e) => {
                e.preventDefault();
                apply({ q: keyword.trim() });
              }}
            >
              <Icon className="text-base text-new-title" name="search" />
              <input
                aria-label="Từ khóa"
                className="w-full border-0 bg-transparent p-0 text-sm leading-[1.4] text-new-title placeholder:text-new-paragraph focus:ring-0"
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo từ khóa"
                type="text"
                value={keyword}
              />
            </form>

            <LocationPicker
              className="relative rounded-lg border border-new-chip px-4 pt-[13px] pb-3.5"
              locations={locations}
              onChange={(location) => apply({ location: location ?? "" })}
              renderTrigger={({ value }) => (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Icon className="text-base text-new-title" name="location_on" />
                      <h4 className="text-sm font-bold leading-[1.2] text-new-title">
                        Điểm đến
                      </h4>
                    </div>
                    <Icon
                      className="text-[28px] text-new-title"
                      name="keyboard_arrow_down"
                    />
                  </div>
                  <div className="pl-[26px] text-sm leading-[1.4]">
                    {value ?? "Tất cả địa điểm"}
                  </div>
                </>
              )}
              value={query.location || null}
            />
          </div>

          <div>
            <Heading icon="category" title="Loại dịch vụ" />
            <div className="space-y-3 pt-5">
              {KIND_FILTERS.map((item) => (
                <label
                  key={item.kind}
                  className="flex cursor-pointer items-center gap-3 transition-colors hover:text-new-teal-cta"
                >
                  <input
                    checked={query.kind === item.kind}
                    className="size-5 border-[1.5px] border-new-checkbox-border text-new-teal-cta focus:ring-0 focus:ring-offset-0"
                    name="service_kind"
                    onChange={() => apply({ kind: item.kind })}
                    type="radio"
                    value={item.kind}
                  />
                  <span className="text-base font-medium leading-normal">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Heading icon="attach_money" title="Khoảng giá" />
            <div className="pt-5">
              <PriceRangeSlider
                key={`${query.minPrice}-${query.maxPrice}`}
                maxPrice={query.maxPrice}
                minPrice={query.minPrice}
                onCommit={(minPrice, maxPrice) => apply({ minPrice, maxPrice })}
              />
            </div>
          </div>

          <div>
            <Heading icon="star" title="Đánh giá" />
            <div className="flex flex-wrap gap-2 pt-5">
              {[1, 2, 3, 4, 5].map((n) => {
                const on = query.minRating === n;
                return (
                  <motion.button
                    key={n}
                    className={`flex cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1 text-sm font-medium leading-[1.4] transition-colors ${
                      on
                        ? "border-new-teal-cta bg-new-teal-cta text-white"
                        : "border-new-chip bg-white text-new-paragraph hover:border-new-teal-cta/50"
                    }`}
                    onClick={() => apply({ minRating: on ? undefined : n })}
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    <Icon className="text-sm text-[#ffb400]" name="star" />
                    {n}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </FadeIn>
  );
}
