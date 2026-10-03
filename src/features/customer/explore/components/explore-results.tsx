"use client";

import { ExploreCard } from "@/features/customer/components/cards";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PAGE_SIZE,
  SORT_OPTIONS,
  type ExploreItem,
  type ExploreSort,
} from "../data";
import { buildExploreUrl, type ExploreQuery } from "../lib/search-params";
import { Pagination } from "./pagination";

type ExploreResultsProps = {
  items: ExploreItem[];
  total: number;
  query: ExploreQuery;
};

export function ExploreResults({ items, total, query }: ExploreResultsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const sortLabel = SORT_OPTIONS.find((s) => s.value === query.sort)?.label;
  const from = total === 0 ? 0 : (query.page - 1) * PAGE_SIZE + 1;
  const to = (query.page - 1) * PAGE_SIZE + items.length;

  function changeSort(sort: ExploreSort) {
    setOpen(false);
    router.push(buildExploreUrl(query, { sort }));
  }

  return (
    <section className="xl:col-span-9">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-new-chip">
        <h4 className="text-base font-bold leading-normal text-new-title">
          Hiển thị {from}–{to} / {total} kết quả
        </h4>
        <div className="relative w-[189px]">
          <button
            className="w-full flex items-center justify-between px-4 py-3 border border-[#aaa] rounded text-base font-medium leading-normal text-new-title"
            onClick={() => setOpen((o) => !o)}
            type="button"
          >
            {sortLabel}
            <span
              aria-hidden
              className={`inline-block p-1 border-solid border-new-title border-r-2 border-b-2 -translate-y-0.5 ${
                open ? "-rotate-[135deg] translate-y-0.5" : "rotate-45"
              }`}
            />
          </button>
          {open && (
            <ul className="absolute z-20 mt-1 w-full bg-white border border-[#aaa] rounded">
              {SORT_OPTIONS.map((s) => (
                <li key={s.value}>
                  <button
                    className={`w-full text-left px-4 py-2 text-base ${
                      s.value === query.sort
                        ? "bg-new-teal-cta text-white"
                        : "text-new-title hover:bg-new-chip"
                    }`}
                    onClick={() => changeSort(s.value)}
                    type="button"
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="py-16 text-center text-base text-new-paragraph">
          Không tìm thấy kết quả phù hợp.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {items.map((item) => (
            <ExploreCard item={item} key={item.id} />
          ))}
        </div>
      )}

      <Pagination
        page={query.page}
        query={query}
        totalPages={Math.ceil(total / PAGE_SIZE)}
      />
    </section>
  );
}
