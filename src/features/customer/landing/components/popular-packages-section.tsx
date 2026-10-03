"use client";

import {
  DestinationCard,
  HotelCard,
  RestaurantCard,
  TourCard,
} from "@/features/customer/components/cards";
import Link from "next/link";
import { useState } from "react";
import { PACKAGE_COPY, PACKAGE_TABS } from "../lib/package-copy";
import type { PackageKind, PackagesByKind } from "../lib/package-types";

export function PopularPackagesSection({
  packages,
}: {
  packages: PackagesByKind;
}) {
  const [activeKind, setActiveKind] = useState<PackageKind>("tour");
  const copy = PACKAGE_COPY[activeKind];
  const itemCount = packages[activeKind].length;

  return (
    <section
      className="w-full relative z-20 py-16 page-x bg-white"
      data-purpose="popular-packages"
    >
      <div className="text-center">
        <div className="mb-8">
          <p className="font-handwriting text-3xl font-bold tracking-wide mb-2 text-new-coral">
            {copy.script}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-gray-900 tracking-tight leading-tight max-w-2xl mx-auto">
            {copy.heading}
          </h2>
        </div>

        <div className="flex items-center justify-center flex-wrap gap-3 mb-12">
          {PACKAGE_TABS.map((tab) => (
            <button
              key={tab.kind}
              aria-pressed={tab.kind === activeKind}
              className={
                tab.kind === activeKind
                  ? "px-7 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition bg-new-teal-active text-white"
                  : "px-6 py-2.5 rounded-lg text-sm font-semibold transition bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
              }
              onClick={() => setActiveKind(tab.kind)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {itemCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left mb-12">
            {activeKind === "tour" &&
              packages.tour.map((tour) => <TourCard key={tour.id} tour={tour} />)}
            {activeKind === "hotel" &&
              packages.hotel.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            {activeKind === "restaurant" &&
              packages.restaurant.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            {activeKind === "destination" &&
              packages.destination.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-12">Chưa có dữ liệu để hiển thị.</p>
        )}

        <div className="flex justify-center">
          <Link
            className="inline-flex items-center gap-2 bg-new-teal hover:bg-new-teal-hover text-white px-8 py-3.5 rounded-lg font-semibold text-sm transition duration-200 shadow-sm"
            href={`/explore?kind=${activeKind}`}
          >
            <span>{copy.cta}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
