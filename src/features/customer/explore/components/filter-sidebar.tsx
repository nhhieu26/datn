import {
  DURATION_FILTERS,
  KIND_FILTERS,
  RATING_FILTERS,
  STYLE_FILTERS,
} from "../data";

export function FilterSidebar() {
  return (
    <aside className="lg:col-span-1 space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Điểm đến
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                  strokeWidth="2"
                />
              </svg>
            </span>
            <input
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#FF5436] focus:border-[#FF5436] focus:bg-white"
              placeholder="Tìm theo địa điểm"
              type="text"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Loại hình</h3>
          <div className="space-y-2.5 text-sm text-gray-600">
            {KIND_FILTERS.map((item) => (
              <label
                key={item.label}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <input
                  className="w-4 h-4 rounded text-[#FF5436] border-gray-300 focus:ring-[#FF5436]"
                  type="checkbox"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Khoảng giá</h3>
          <div className="px-1 pt-2">
            <div className="relative flex items-center">
              <div className="h-1 w-full rounded-full bg-[#FF5436]" />
              <div className="absolute left-0 -ml-1 w-4 h-4 rounded-full bg-white border-[3px] border-[#FF5436] shadow" />
              <div className="absolute right-0 -mr-1 w-4 h-4 rounded-full bg-white border-[3px] border-[#FF5436] shadow" />
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 font-medium mt-3">
              <span>0đ</span>
              <span>20.000.000đ+</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Đánh giá</h3>
          <div className="space-y-2.5 text-sm text-gray-600">
            {RATING_FILTERS.map((label) => (
              <label
                key={label}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <input
                  className="w-4 h-4 rounded text-[#FF5436] border-gray-300 focus:ring-[#FF5436]"
                  type="checkbox"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Thời lượng</h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            {DURATION_FILTERS.map((label) => (
              <button
                key={label}
                className="py-2 px-3 text-center rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Phong cách</h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            {STYLE_FILTERS.map((label) => (
              <button
                key={label}
                className="py-2 px-3 text-center rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            type="button"
          >
            Xóa bộ lọc
          </button>
          <button
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-full hover:bg-slate-800 shadow-sm"
            type="button"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </aside>
  );
}
