"use client";

import Image from "next/image";
import { useEffect } from "react";
import { MAP_LIST_ITEMS, TOTAL_RESULTS, type ExploreKind } from "../data";

const BADGE_TONE: Record<ExploreKind, string> = {
  destination: "bg-orange-50 text-[#FF5436] border border-orange-200/60",
  hotel: "bg-blue-50 text-blue-700 border border-blue-200/60",
  restaurant: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
  tour: "bg-purple-50 text-purple-700 border border-purple-200/60",
};

const BADGE_LABEL: Record<ExploreKind, string> = {
  destination: "Điểm đến",
  hotel: "Khách sạn",
  restaurant: "Nhà hàng",
  tour: "Tour",
};

const MODAL_FILTERS = ["Tất cả", "Điểm đến", "Khách sạn", "Nhà hàng", "Tour"];

export function MapModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col w-full max-w-6xl h-[88vh] border border-gray-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-white z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5436] flex items-center justify-center border border-orange-100 shadow-sm">
              <svg
                className="w-5 h-5"
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
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  Bản đồ khám phá
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                  {TOTAL_RESULTS} địa điểm
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                Di chuyển trên bản đồ hoặc chọn từ danh sách để xem chi tiết
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
            {MODAL_FILTERS.map((filter, index) => (
              <button
                key={filter}
                className={
                  index === 0
                    ? "px-3.5 py-1.5 rounded-full bg-slate-900 text-white shadow-sm flex items-center gap-1"
                    : "px-3.5 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors"
                }
                type="button"
              >
                {index === 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
                {filter}
              </button>
            ))}
          </div>

          <button
            aria-label="Đóng"
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            onClick={onClose}
            type="button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          <div className="w-full md:w-[380px] lg:w-[410px] border-r border-gray-200 bg-gray-50/70 overflow-y-auto custom-scrollbar p-4 space-y-3.5 flex-shrink-0 z-10">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Danh sách nổi bật
              </span>
              <span className="text-xs text-gray-400">
                Hiển thị trong khu vực
              </span>
            </div>

            {MAP_LIST_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3 border border-gray-200/90 shadow-sm hover:border-[#FF5436] hover:shadow-md transition-all cursor-pointer group flex gap-3.5"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    alt={item.title}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    fill
                    sizes="96px"
                    src={item.image}
                  />
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${BADGE_TONE[item.kind]}`}
                      >
                        {BADGE_LABEL[item.kind]}
                      </span>
                      <span className="text-[11px] font-bold text-amber-500">
                        ★ {item.rating}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#FF5436] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {item.location}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <span
                      className={
                        item.kind === "destination"
                          ? "text-xs font-semibold text-gray-600"
                          : "text-xs font-bold text-gray-900"
                      }
                    >
                      {item.priceText}
                      {item.priceUnit && (
                        <span className="text-[10px] font-normal text-gray-400">
                          {item.priceUnit}
                        </span>
                      )}
                    </span>
                    <span className="text-xs font-semibold text-[#FF5436] flex items-center">
                      Xem vị trí →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 relative bg-[#e5ecf4] overflow-hidden select-none">
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1000 700"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="waterGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#d4e6f6" />
                  <stop offset="100%" stopColor="#c5ddf4" />
                </linearGradient>
                <linearGradient id="landGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#f5f7fa" />
                  <stop offset="100%" stopColor="#edf2f7" />
                </linearGradient>
              </defs>

              <rect width="1000" height="700" fill="url(#waterGrad)" />

              <path
                d="M-50,0 L320,0 C380,80 390,140 430,220 C470,300 450,380 520,460 C580,530 620,580 650,750 L-50,750 Z"
                fill="url(#landGrad)"
                stroke="#d2deea"
                strokeWidth="2"
              />
              <path
                d="M680,-50 C710,120 780,180 840,240 C910,310 930,420 1050,460 L1050,-50 Z"
                fill="url(#landGrad)"
                stroke="#d2deea"
                strokeWidth="2"
              />
              <ellipse
                cx="610"
                cy="210"
                fill="url(#landGrad)"
                rx="65"
                ry="38"
                stroke="#d2deea"
                strokeWidth="2"
              />
              <ellipse
                cx="780"
                cy="460"
                fill="url(#landGrad)"
                rx="80"
                ry="46"
                stroke="#d2deea"
                strokeWidth="2"
              />
              <ellipse
                cx="890"
                cy="540"
                fill="url(#landGrad)"
                rx="45"
                ry="28"
                stroke="#d2deea"
                strokeWidth="2"
              />

              <path
                d="M50,80 Q140,50 180,130 T250,220 Q180,290 90,240 Z"
                fill="#e8f5e9"
                opacity="0.8"
              />
              <path
                d="M120,400 Q260,350 310,470 T220,620 Q90,580 120,400 Z"
                fill="#e8f5e9"
                opacity="0.8"
              />
              <path
                d="M610,195 Q640,190 650,215 T600,230 Q580,210 610,195 Z"
                fill="#e8f5e9"
                opacity="0.7"
              />

              <g
                opacity="0.95"
                stroke="#ffffff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="7"
              >
                <path
                  d="M-20,160 Q180,180 280,290 T430,490 Q510,590 560,720"
                  fill="none"
                />
                <path
                  d="M150,-20 Q190,140 280,290 T240,540 L180,720"
                  fill="none"
                />
                <path d="M280,290 L490,260 L610,210" fill="none" />
                <path
                  d="M430,490 Q620,470 780,460"
                  fill="none"
                  strokeDasharray="8 6"
                />
              </g>
              <g
                stroke="#fed7aa"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3.5"
              >
                <path
                  d="M-20,160 Q180,180 280,290 T430,490 Q510,590 560,720"
                  fill="none"
                />
                <path
                  d="M150,-20 Q190,140 280,290 T240,540 L180,720"
                  fill="none"
                />
                <path d="M280,290 L490,260" fill="none" />
              </g>

              <text
                fill="#94a3b8"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontSize="13"
                fontWeight="700"
                letterSpacing="2"
                x="70"
                y="50"
              >
                VỊNH BẮC BỘ
              </text>
              <text
                fill="#94a3b8"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontSize="12"
                fontWeight="700"
                letterSpacing="1.5"
                x="690"
                y="110"
              >
                BIỂN ĐÔNG
              </text>
              <text
                fill="#64748b"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontSize="11"
                fontWeight="600"
                x="600"
                y="270"
              >
                Quần đảo Cù Lao
              </text>
            </svg>

            <div className="absolute left-[36%] top-[38%] -translate-x-1/2 -translate-y-1/2 z-20 group">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-white rounded-2xl p-2.5 shadow-xl border border-gray-100 pointer-events-auto">
                <div className="relative h-24 rounded-xl overflow-hidden mb-2">
                  <Image
                    alt="InterContinental"
                    className="object-cover"
                    fill
                    sizes="224px"
                    src={MAP_LIST_ITEMS[0].image}
                  />
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    Khách sạn
                  </span>
                </div>
                <h5 className="text-xs font-bold text-gray-900 truncate">
                  InterContinental Danang
                </h5>
                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className="font-bold text-[#FF5436]">4.500.000đ</span>
                  <span className="text-amber-500 font-semibold">★ 4.7</span>
                </div>
                <div className="w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
              </div>

              <button
                className="flex items-center gap-1.5 bg-[#FF5436] hover:bg-[#e04427] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white ring-4 ring-orange-500/20 transform hover:scale-110 transition-all cursor-pointer"
                type="button"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>4.5 Tr</span>
              </button>
            </div>

            <div className="absolute left-[26%] top-[28%] -translate-x-1/2 -translate-y-1/2 z-10">
              <button
                className="flex items-center gap-1 bg-white hover:bg-slate-900 hover:text-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-gray-200 hover:border-slate-900 transform hover:scale-110 transition-all cursor-pointer"
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Nén • 300K</span>
              </button>
            </div>

            <div className="absolute left-[58%] top-[22%] -translate-x-1/2 -translate-y-1/2 z-10">
              <button
                className="flex items-center gap-1 bg-white hover:bg-[#FF5436] hover:text-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-gray-200 hover:border-[#FF5436] transform hover:scale-110 transition-all cursor-pointer"
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Tour Hạ Long • 2.9 Tr</span>
              </button>
            </div>

            <div className="absolute left-[47%] top-[65%] -translate-x-1/2 -translate-y-1/2 z-10">
              <button
                className="flex items-center gap-1 bg-white hover:bg-slate-900 hover:text-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-gray-200 hover:border-slate-900 transform hover:scale-110 transition-all cursor-pointer"
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Amanoi • 28 Tr</span>
              </button>
            </div>

            <div className="absolute left-[78%] top-[56%] -translate-x-1/2 -translate-y-1/2 z-10">
              <button
                className="flex items-center gap-1 bg-white hover:bg-purple-600 hover:text-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-gray-200 hover:border-purple-600 transform hover:scale-110 transition-all cursor-pointer"
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Lặn Biển • 1.8 Tr</span>
              </button>
            </div>

            <div className="absolute left-[20%] top-[52%] -translate-x-1/2 -translate-y-1/2 z-10">
              <button
                className="flex items-center gap-1 bg-white hover:bg-slate-900 hover:text-white text-gray-900 text-xs font-bold px-2.5 py-1.5 rounded-full shadow-md border border-gray-200 hover:border-slate-900 transform hover:scale-110 transition-all cursor-pointer"
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Pizza 4P&apos;s</span>
              </button>
            </div>

            <div className="absolute left-[70%] top-[34%] -translate-x-1/2 -translate-y-1/2 z-10">
              <button
                className="flex items-center gap-1 bg-white hover:bg-[#FF5436] hover:text-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-gray-200 hover:border-[#FF5436] transform hover:scale-110 transition-all cursor-pointer"
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-[#FF5436]" />
                <span>Cù Lao Xanh ★ 4.8</span>
              </button>
            </div>

            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
              <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-gray-200 flex items-center gap-1">
                <button className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-sm">
                  Bản đồ
                </button>
                <button className="px-3 py-1.5 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-semibold transition-colors">
                  Vệ tinh
                </button>
                <button className="px-3 py-1.5 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-semibold transition-colors">
                  Địa hình
                </button>
              </div>
              <button className="self-end bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-gray-200 text-xs font-medium text-gray-700 hover:bg-white flex items-center gap-1.5">
                <input
                  className="w-3.5 h-3.5 rounded text-[#FF5436] border-gray-300 focus:ring-[#FF5436]"
                  defaultChecked
                  id="search-on-move"
                  type="checkbox"
                />
                <label className="cursor-pointer" htmlFor="search-on-move">
                  Tìm kiếm khi di chuyển
                </label>
              </button>
            </div>

            <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
              <button
                className="w-10 h-10 rounded-2xl bg-white shadow-lg border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors"
                title="Vị trí của tôi"
                type="button"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col divide-y divide-gray-100">
                <button
                  className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg font-bold transition-colors"
                  title="Phóng to"
                  type="button"
                >
                  +
                </button>
                <button
                  className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg font-bold transition-colors"
                  title="Thu nhỏ"
                  type="button"
                >
                  −
                </button>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 z-20 hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-gray-200 text-xs font-medium text-gray-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5436]" />
                <span>Điểm đến</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Khách sạn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Nhà hàng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span>Tour</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
