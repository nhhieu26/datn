"use client";

import { ExploreCard } from "@/features/customer/components/cards";
import { AnimatePresence, motion } from "motion/react";
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
  const queryKey = `${query.kind}-${query.location}-${query.q}-${query.sort}-${query.page}-${query.minPrice}-${query.maxPrice}-${query.minRating}`;

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
            className="w-full flex items-center justify-between px-4 py-3 border border-[#aaa] rounded text-base font-medium leading-normal text-new-title cursor-pointer transition-colors hover:border-new-teal-cta"
            onClick={() => setOpen((o) => !o)}
            type="button"
          >
            {sortLabel}
            <span
              aria-hidden
              className={`inline-block p-1 border-solid border-new-title border-r-2 border-b-2 -translate-y-0.5 transition-transform duration-200 ${
                open ? "-rotate-[135deg] translate-y-0.5" : "rotate-45"
              }`}
            />
          </button>
          <AnimatePresence>
            {open && (
              <motion.ul
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute z-20 mt-1 w-full bg-white border border-[#aaa] rounded shadow-lg overflow-hidden origin-top"
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              >
                {SORT_OPTIONS.map((s) => (
                  <li key={s.value}>
                    <button
                      className={`w-full text-left px-4 py-2 text-base transition-colors cursor-pointer ${
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
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {items.length === 0 ? (
          <motion.p
            key="empty"
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center text-base text-new-paragraph"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
          >
            Không tìm thấy kết quả phù hợp.
          </motion.p>
        ) : (
          <motion.div
            key={queryKey}
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
            exit={{ opacity: 0, y: 8, transition: { duration: 0.14 } }}
            initial="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.055, delayChildren: 0.02 },
              },
            }}
          >
            {items.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                <ExploreCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Pagination
        page={query.page}
        query={query}
        totalPages={Math.ceil(total / PAGE_SIZE)}
      />
    </section>
  );
}
