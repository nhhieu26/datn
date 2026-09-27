const FILTERS = [
  {
    label: "Tất cả",
    icon: "M4 6h16M4 12h16M4 18h16",
    active: true,
  },
  {
    label: "Điểm đến",
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
    active: false,
  },
  {
    label: "Khách sạn",
    icon: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    active: false,
  },
  {
    label: "Nhà hàng",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    active: false,
  },
  {
    label: "Tour du lịch",
    icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z",
    active: false,
  },
];

export function SearchPillsBar() {
  return (
    <section
      className="flex flex-wrap items-center gap-3 mb-5"
      data-purpose="quick-search-filters"
    >
      <div className="relative flex-1 min-w-[280px] max-w-sm">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </span>
        <input
          className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200/90 rounded-full text-xs md:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-coral focus:border-transparent"
          placeholder="Bạn muốn đi đâu?"
          type="text"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
        {FILTERS.map((filter) =>
          filter.active ? (
            <button
              key={filter.label}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#111827] text-white text-xs font-semibold shadow-sm"
            >
              <svg
                className="w-3.5 h-3.5"
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
              <span className="">{filter.label}</span>
            </button>
          ) : (
            <button
              key={filter.label}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-500"
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
              <span className="">{filter.label}</span>
            </button>
          ),
        )}
      </div>
    </section>
  );
}
