import { MapWidget } from "./map-widget";
import {
  BreakfastIcon,
  CalendarIcon,
  ChevronDownIcon,
  FamilyIcon,
  OceanViewIcon,
  PetIcon,
  PoolIcon,
  UserIcon,
  WifiIcon,
} from "./icons";

const CATEGORIES = [
  { label: "Điểm đến", count: 124 },
  { label: "Khách sạn", count: 312 },
  { label: "Nhà hàng", count: 284 },
  { label: "Tour & Trải nghiệm", count: 156 },
];

const RATINGS = [
  { label: "5 sao", count: 342 },
  { label: "4 sao trở lên", count: 671 },
  { label: "3 sao trở lên", count: 812 },
];

const AREAS = [
  { label: "Ubud", count: 178 },
  { label: "Seminyak", count: 142 },
  { label: "Canggu", count: 121 },
  { label: "Uluwatu", count: 98 },
  { label: "Nusa Dua", count: 76 },
  { label: "Denpasar", count: 54 },
];

const AMENITIES = [
  { label: "WiFi miễn phí", Icon: WifiIcon },
  { label: "Hồ bơi", Icon: PoolIcon },
  { label: "Bao gồm bữa sáng", Icon: BreakfastIcon },
  { label: "View biển", Icon: OceanViewIcon },
  { label: "Phù hợp gia đình", Icon: FamilyIcon },
  { label: "Cho mang thú cưng", Icon: PetIcon },
];

function Checkbox() {
  return (
    <input
      className="w-4 h-4 rounded border-slate-300 accent-slate-900"
      type="checkbox"
    />
  );
}

function FilterHeading({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
      {children}
    </h3>
  );
}

function Divider() {
  return <div className="h-px bg-slate-200" />;
}

export function FilterSidebar() {
  return (
    <aside className="lg:col-span-3 space-y-6">
      <MapWidget />

      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
          Ngày
        </label>
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 shadow-sm hover:border-slate-300 cursor-pointer">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <span>18 Th06, 2026 – 25 Th06, 2026</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
          Số khách
        </label>
        <div className="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 shadow-sm hover:border-slate-300 cursor-pointer">
          <div className="flex items-center gap-2.5">
            <UserIcon className="w-4 h-4 text-slate-400" />
            <span>2 người lớn</span>
          </div>
          <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      <Divider />

      <div className="space-y-3">
        <FilterHeading>Danh mục</FilterHeading>
        <div className="space-y-2 text-xs">
          {CATEGORIES.map((category) => (
            <label
              key={category.label}
              className="flex items-center justify-between cursor-pointer group"
            >
              <span className="flex items-center gap-2.5 text-slate-700 font-medium">
                <Checkbox />
                <span>{category.label}</span>
              </span>
              <span className="text-slate-400 text-[11px]">
                {category.count}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Divider />

      <div className="space-y-3">
        <FilterHeading>Khoảng giá</FilterHeading>
        <div className="pt-1">
          <input
            className="w-full accent-slate-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            defaultValue={480}
            max={500}
            min={0}
            type="range"
          />
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mt-2">
            <span>$0</span>
            <span>$500+</span>
          </div>
        </div>
      </div>

      <Divider />

      <div className="space-y-3">
        <FilterHeading>Đánh giá</FilterHeading>
        <div className="space-y-2 text-xs">
          {RATINGS.map((rating) => (
            <label
              key={rating.label}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <span className="text-amber-400">★</span>
                <span>{rating.label}</span>
              </div>
              <span className="text-slate-400 text-[11px]">
                {rating.count}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Divider />

      <div className="space-y-3">
        <FilterHeading>Khu vực phổ biến</FilterHeading>
        <div className="space-y-2 text-xs">
          {AREAS.map((area) => (
            <label
              key={area.label}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2.5 text-slate-700">
                <Checkbox />
                <span>{area.label}</span>
              </span>
              <span className="text-slate-400 text-[11px]">{area.count}</span>
            </label>
          ))}
          <button className="text-xs font-semibold text-slate-600 hover:text-slate-900 pt-1 flex items-center gap-1">
            <span>Xem thêm</span>
            <ChevronDownIcon className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      <Divider />

      <div className="space-y-3">
        <FilterHeading>Tiện ích</FilterHeading>
        <div className="space-y-2.5 text-xs text-slate-700">
          {AMENITIES.map(({ label, Icon }) => (
            <label
              key={label}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <Checkbox />
              <span className="flex items-center gap-1.5 font-medium">
                <Icon className="w-3.5 h-3.5 text-slate-500" />
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button className="w-full py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition shadow-sm">
        Xóa bộ lọc
      </button>
    </aside>
  );
}
