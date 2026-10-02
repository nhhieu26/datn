"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type HeroSearchCardProps = { locations: string[] };

function formatDate(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function HeroSearchCard({ locations }: HeroSearchCardProps) {
  const router = useRouter();
  const [location, setLocation] = useState<string | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [keyword, setKeyword] = useState("");
  const locationRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!locationRef.current?.contains(target)) setLocationOpen(false);
      if (!dateRef.current?.contains(target)) setDateOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (location) params.set("location", location);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`/explore?${params.toString()}`);
  }

  const dateText =
    from || to
      ? `${formatDate(from) || "…"} - ${formatDate(to) || "…"}`
      : "Chọn ngày";

  const filteredLocations = locations.filter((name) =>
    name.toLowerCase().includes(locationQuery.trim().toLowerCase()),
  );

  return (
    <div
      className="w-full max-w-[460px] bg-white rounded-2xl shadow-xl p-8 sm:p-9 relative"
      data-purpose="booking-form-card"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Tìm kiếm nhanh
        </h2>
        <p className="text-xs text-gray-500 mt-2">
          Lựa chọn điểm đến lý tưởng và tận hưởng kỳ nghỉ hoàn hảo.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div
          ref={locationRef}
          className="border-b border-gray-200 pb-3 pt-1 relative z-20"
        >
          <button
            className="w-full text-left flex items-center justify-between cursor-pointer"
            onClick={() => setLocationOpen((open) => !open)}
            type="button"
          >
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-bold text-gray-900">Địa điểm</span>
                <span className="block text-xs text-gray-600 mt-0.5 font-medium">
                  {location ?? "Tất cả địa điểm"}
                </span>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-gray-800 transition-transform duration-200 ${locationOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {locationOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden text-left">
              <div className="p-2 border-b border-gray-100">
                <input
                  autoFocus
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-new-teal focus:ring-0"
                  onChange={(event) => setLocationQuery(event.target.value)}
                  placeholder="Tìm địa điểm..."
                  type="text"
                  value={locationQuery}
                />
              </div>
              <div className="max-h-56 overflow-y-auto">
                {!locationQuery.trim() && (
                  <button
                    className={`block w-full text-left px-4 py-3 text-sm font-medium transition ${
                      location === null
                        ? "bg-new-teal text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setLocation(null);
                      setLocationOpen(false);
                      setLocationQuery("");
                    }}
                    type="button"
                  >
                    Tất cả địa điểm
                  </button>
                )}
                {filteredLocations.map((name) => (
                  <button
                    key={name}
                    className={`block w-full text-left px-4 py-3 text-sm font-medium transition ${
                      name === location
                        ? "bg-new-teal text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setLocation(name);
                      setLocationOpen(false);
                      setLocationQuery("");
                    }}
                    type="button"
                  >
                    {name}
                  </button>
                ))}
                {filteredLocations.length === 0 && (
                  <p className="px-4 py-3 text-sm text-gray-500">
                    Không tìm thấy địa điểm
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          ref={dateRef}
          className="border-b border-gray-200 pb-3 pt-1 relative z-10"
        >
          <button
            className="w-full text-left flex items-center justify-between cursor-pointer"
            onClick={() => setDateOpen((open) => !open)}
            type="button"
          >
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-bold text-gray-900">Ngày</span>
                <span className="block text-xs text-gray-600 mt-0.5 font-medium">{dateText}</span>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-gray-800 transition-transform duration-200 ${dateOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {dateOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-100 p-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-medium text-gray-600">
                  Từ ngày
                  <input
                    className="mt-1 w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-800"
                    onChange={(event) => setFrom(event.target.value)}
                    type="date"
                    value={from}
                  />
                </label>
                <label className="text-xs font-medium text-gray-600">
                  Đến ngày
                  <input
                    className="mt-1 w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-800"
                    min={from || undefined}
                    onChange={(event) => setTo(event.target.value)}
                    type="date"
                    value={to}
                  />
                </label>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  className="bg-new-teal hover:bg-new-teal-hover text-white text-sm font-medium px-4 py-1.5 rounded-md transition shadow-sm"
                  onClick={() => setDateOpen(false)}
                  type="button"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 pb-3 pt-1">
          <label className="flex items-start space-x-3">
            <div className="mt-0.5 text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="block text-sm font-bold text-gray-900">Từ khóa</span>
              <input
                className="mt-0.5 w-full border-0 p-0 text-xs text-gray-600 placeholder-gray-500 focus:ring-0"
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tour nghỉ dưỡng, resort..."
                type="text"
                value={keyword}
              />
            </div>
          </label>
        </div>

        <div className="pt-4">
          <button
            className="w-full bg-new-coral hover:bg-new-coral-hover text-white py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition duration-150 shadow-sm"
            data-purpose="submit-search"
            type="submit"
          >
            Tìm kiếm ngay
          </button>
        </div>
      </form>
    </div>
  );
}
