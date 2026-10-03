"use client";

import { useState } from "react";
import { EXPLORE_ITEMS, type ExploreItem } from "../data";
import { DestinationCard } from "./destination-card";
import { HotelCard } from "./hotel-card";
import { Pagination } from "./pagination";
import { RestaurantCard } from "./restaurant-card";
import { TourCard } from "./tour-card";

const SORTS = [
  "Phổ biến nhất",
  "Giá thấp đến cao",
  "Giá cao đến thấp",
  "Mới nhất",
];

function ExploreCardItem({ item }: { item: ExploreItem }) {
  switch (item.kind) {
    case "destination":
      return <DestinationCard item={item} />;
    case "hotel":
      return <HotelCard item={item} />;
    case "restaurant":
      return <RestaurantCard item={item} />;
    case "tour":
      return <TourCard item={item} />;
  }
}

export function ExploreResults() {
  const [sort, setSort] = useState(SORTS[0]);
  const [open, setOpen] = useState(false);

  return (
    <section className="xl:col-span-9">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-new-chip">
        <h4 className="text-base font-bold leading-normal text-new-title">
          Hiển thị {EXPLORE_ITEMS.length} / {EXPLORE_ITEMS.length} kết quả
        </h4>
        <div className="relative w-[189px]">
          <button
            className="w-full flex items-center justify-between px-4 py-3 border border-[#aaa] rounded text-base font-medium leading-normal text-new-title"
            onClick={() => setOpen((o) => !o)}
            type="button"
          >
            {sort}
            <span
              aria-hidden
              className={`inline-block p-1 border-solid border-new-title border-r-2 border-b-2 -translate-y-0.5 ${
                open ? "-rotate-[135deg] translate-y-0.5" : "rotate-45"
              }`}
            />
          </button>
          {open && (
            <ul className="absolute z-20 mt-1 w-full bg-white border border-[#aaa] rounded">
              {SORTS.map((s) => (
                <li key={s}>
                  <button
                    className={`w-full text-left px-4 py-2 text-base ${
                      s === sort
                        ? "bg-new-teal-cta text-white"
                        : "text-new-title hover:bg-new-chip"
                    }`}
                    onClick={() => {
                      setSort(s);
                      setOpen(false);
                    }}
                    type="button"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {EXPLORE_ITEMS.map((item) => (
          <ExploreCardItem item={item} key={item.id} />
        ))}
      </div>

      <Pagination />
    </section>
  );
}
