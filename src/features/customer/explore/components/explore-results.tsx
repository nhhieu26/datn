import { EXPLORE_ITEMS, TOTAL_RESULTS, type ExploreItem } from "../data";
import { DestinationCard } from "./destination-card";
import { HotelCard } from "./hotel-card";
import { Pagination } from "./pagination";
import { RestaurantCard } from "./restaurant-card";
import { TourCard } from "./tour-card";

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
  return (
    <section className="lg:col-span-3 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <span className="text-sm font-bold text-gray-900">
          {TOTAL_RESULTS} kết quả
        </span>
        <div className="flex items-center gap-3">
          <div className="relative inline-block text-left">
            <button
              className="inline-flex justify-between items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              type="button"
            >
              <span>Phổ biến nhất</span>
              <svg
                className="h-4 w-4 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  clipRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  fillRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
            type="button"
          >
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>Xem bản đồ</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {EXPLORE_ITEMS.map((item) => (
          <ExploreCardItem item={item} key={item.id} />
        ))}
      </div>

      <Pagination />
    </section>
  );
}
