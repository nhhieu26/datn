"use client";

import { useState } from "react";
import { KIND_FILTERS, type ExploreKind } from "../data";

const DESTINATIONS = [
  "Đà Nẵng, Việt Nam",
  "Quảng Ninh, Việt Nam",
  "Hồ Chí Minh, Việt Nam",
];

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span aria-hidden className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  );
}

function Heading({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 pt-[30px] pb-4 border-b border-new-chip">
      <Icon className="text-[26px] text-new-title" name={icon} />
      <h4 className="text-lg xl:text-xl font-bold leading-[1.4] text-new-title">
        {title}
      </h4>
    </div>
  );
}

export function FilterSidebar() {
  const [keyword, setKeyword] = useState("");
  const [kind, setKind] = useState<ExploreKind>("tour");
  const [dest, setDest] = useState(DESTINATIONS[0]);
  const [stars, setStars] = useState<number[]>([4]);

  return (
    <aside className="xl:col-span-3">
      <div className="rounded-lg border border-new-chip px-5 pb-[30px]">
        <Heading icon="tune" title="Bộ lọc tìm kiếm" />

        <div className="mt-5">
          <div className="mb-3 flex items-center gap-2.5 rounded-lg border border-new-chip px-4 py-3">
            <Icon className="text-base text-new-title" name="search" />
            <input
              aria-label="Từ khóa"
              className="w-full border-0 bg-transparent p-0 text-sm leading-[1.4] text-new-title placeholder:text-new-paragraph focus:ring-0"
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo từ khóa"
              type="text"
              value={keyword}
            />
          </div>

          <div className="relative rounded-lg border border-new-chip px-4 pt-[13px] pb-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Icon className="text-base text-new-title" name="location_on" />
                <h4 className="text-sm font-bold leading-[1.2] text-new-title">
                  Điểm đến
                </h4>
              </div>
              <Icon
                className="text-[28px] text-new-title"
                name="keyboard_arrow_down"
              />
            </div>
            <div className="pl-[26px] text-sm leading-[1.4]">{dest}</div>
            <select
              aria-label="Điểm đến"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={(e) => setDest(e.target.value)}
              value={dest}
            >
              {DESTINATIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Heading icon="category" title="Loại dịch vụ" />
          <div className="space-y-3 pt-5">
            {KIND_FILTERS.map((item) => (
              <label
                key={item.kind}
                className="flex cursor-pointer items-center gap-3"
              >
                <input
                  checked={kind === item.kind}
                  className="size-5 border-[1.5px] border-new-checkbox-border text-new-teal-cta focus:ring-0 focus:ring-offset-0"
                  name="service_kind"
                  onChange={() => setKind(item.kind)}
                  type="radio"
                  value={item.kind}
                />
                <span className="text-base font-medium leading-normal">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Heading icon="attach_money" title="Khoảng giá" />
          <div className="pt-6">
            <div className="relative ml-2 h-2 w-[96%] rounded-full bg-new-track">
              <div className="absolute left-0 h-full w-[32.4324%] bg-new-teal-cta" />
              <span className="absolute -top-1.5 left-0 -ml-2.5 size-5 rounded-full border-2 border-new-teal-cta bg-white" />
              <span className="absolute -top-1.5 left-[32.4324%] -ml-2.5 size-5 rounded-full border-2 border-new-teal-cta bg-white" />
            </div>
            <div className="mt-6 flex items-center gap-1">
              <p className="text-base font-medium leading-normal">Giá:</p>
              <span className="w-full text-base font-medium leading-normal">
                $130 - $250
              </span>
              <button
                className="rounded bg-new-chip px-2.5 py-1 whitespace-nowrap text-sm font-medium leading-[1.4]"
                type="button"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>

        <div>
          <Heading icon="star" title="Đánh giá" />
          <div className="flex flex-wrap gap-2 pt-5">
            {[1, 2, 3, 4, 5].map((n) => {
              const on = stars.includes(n);
              return (
                <button
                  key={n}
                  className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-sm font-medium leading-[1.4] transition-colors ${
                    on
                      ? "border-new-teal-cta bg-new-teal-cta text-white"
                      : "border-new-chip bg-white text-new-paragraph"
                  }`}
                  onClick={() =>
                    setStars((s) =>
                      s.includes(n) ? s.filter((x) => x !== n) : [...s, n],
                    )
                  }
                  type="button"
                >
                  <Icon className="text-sm text-[#ffb400]" name="star" />
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
