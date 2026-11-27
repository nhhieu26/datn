"use client";

import { FadeIn } from "@/features/customer/components/motion";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LocationPicker } from "../../components/location-picker";
import { clearSearchesAction, deleteSearchAction } from "../actions";
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

export type RecentSearch = { id: string; query: string };

type FilterSidebarProps = {
  locations: string[];
  query: ExploreQuery;
  recentSearches: RecentSearch[];
};

export function FilterSidebar({
  locations,
  query,
  recentSearches,
}: FilterSidebarProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(query.q);
  const [historyOpen, setHistoryOpen] = useState(false);
  // id các mục vừa xóa, ẩn ngay trong lúc chờ server
  const [removed, setRemoved] = useState<ReadonlySet<string>>(new Set());
  const [, startTransition] = useTransition();
  const history = recentSearches.filter((s) => !removed.has(s.id));

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
              className="relative mb-3 flex items-center gap-2.5 rounded-lg border border-new-chip px-4 py-3 transition-colors focus-within:border-new-teal-cta"
              onSubmit={(e) => {
                e.preventDefault();
                setHistoryOpen(false);
                apply({ q: keyword.trim() });
              }}
            >
              <Icon className="text-base text-new-title" name="search" />
              <input
                aria-label="Từ khóa"
                className="w-full border-0 bg-transparent p-0 text-sm leading-[1.4] text-new-title placeholder:text-new-paragraph focus:ring-0"
                autoComplete="off"
                onBlur={() => setHistoryOpen(false)}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => setHistoryOpen(true)}
                placeholder="Mô tả chuyến đi bạn muốn..."
                type="text"
                value={keyword}
              />
              {historyOpen && history.length > 0 && (
                <div
                  className="absolute left-0 right-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-lg border border-new-chip bg-white py-2 shadow-lg"
                  // giữ focus ở ô nhập để click vào danh sách không đóng dropdown trước
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="flex items-center justify-between px-4 pb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-new-paragraph">
                      Tìm kiếm gần đây
                    </span>
                    <button
                      className="cursor-pointer text-xs font-medium text-new-teal-cta hover:underline"
                      onClick={() => {
                        setRemoved(
                          new Set([...removed, ...history.map((h) => h.id)]),
                        );
                        startTransition(() => void clearSearchesAction());
                      }}
                      type="button"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                  <ul>
                    {history.map((item) => (
                      <li
                        className="group flex items-center gap-2 px-4 transition-colors hover:bg-new-chip"
                        key={item.id}
                      >
                        <Icon className="text-base text-new-paragraph" name="history" />
                        <button
                          className="min-w-0 flex-1 cursor-pointer truncate py-2 text-left text-sm text-new-title"
                          onClick={() => {
                            setKeyword(item.query);
                            setHistoryOpen(false);
                            apply({ q: item.query });
                          }}
                          type="button"
                        >
                          {item.query}
                        </button>
                        <button
                          aria-label={`Xóa "${item.query}" khỏi lịch sử`}
                          className="cursor-pointer text-new-paragraph opacity-60 transition-opacity hover:opacity-100"
                          onClick={() => {
                            setRemoved((prev) => new Set(prev).add(item.id));
                            startTransition(
                              () => void deleteSearchAction(item.id),
                            );
                          }}
                          type="button"
                        >
                          <Icon className="text-base" name="close" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
