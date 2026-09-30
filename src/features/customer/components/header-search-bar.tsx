"use client";

import { useState } from "react";

const FILTERS = [
  { label: "Tất cả", icon: "" },
  {
    label: "Điểm đến",
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    label: "Khách sạn",
    icon: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  },
  {
    label: "Nhà hàng",
    icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
  },
  {
    label: "Tour du lịch",
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  },
];

export function HeaderSearchBar() {
  const [active, setActive] = useState("Tất cả");

  return (
    <div
      className="py-3 pb-5 flex flex-wrap items-center gap-3"
      data-purpose="header-search"
    >
      <div className="relative flex-1 min-w-[280px] max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
          </svg>
        </span>
        <input
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5436] focus:bg-white text-gray-800"
          placeholder="Bạn muốn khám phá điều gì?"
          type="text"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm font-medium">
        {FILTERS.map((filter) => {
          const isActive = filter.label === active;

          return (
            <button
              key={filter.label}
              className={
                isActive
                  ? "flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white shadow-sm whitespace-nowrap"
                  : "flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-gray-300 whitespace-nowrap transition-colors"
              }
              onClick={() => setActive(filter.label)}
              type="button"
            >
              {isActive ? (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              ) : (
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d={filter.icon}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              )}
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
