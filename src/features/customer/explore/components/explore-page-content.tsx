import { TOTAL_RESULTS } from "../data";
import { ExploreResults } from "./explore-results";
import { FilterSidebar } from "./filter-sidebar";

export function ExplorePageContent() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Khám phá
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-500">
            Khám phá tour, khách sạn, nhà hàng và điểm đến phù hợp với phong cách
            du lịch của bạn.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            {TOTAL_RESULTS} kết quả
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <FilterSidebar />
        <ExploreResults />
      </div>
    </main>
  );
}
