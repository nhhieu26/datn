"use client";

import { useState } from "react";
import type { RoomDraft } from "./hotel-form";

function formatPrice(value: string) {
  const amount = Number(value);
  if (!value || Number.isNaN(amount)) return "Chưa có giá";
  return `${amount.toLocaleString("vi-VN")} đ`;
}

function lowestRoomPrice(rooms: RoomDraft[]) {
  const priced = rooms
    .map((room) => Number(room.basePrice))
    .filter((price) => !Number.isNaN(price) && price > 0);
  if (priced.length === 0) return "";
  return String(Math.min(...priced));
}

const tabs = ["Tổng quan", "Phòng", "Đánh giá"] as const;
type Tab = (typeof tabs)[number];

export function HotelPreviewCard({
  name,
  provinceName,
  address,
  description,
  amenities,
  tagNames,
  rooms,
  photoUrl,
  photoCount,
}: {
  name: string;
  provinceName?: string;
  address: string;
  description: string;
  amenities: string[];
  tagNames: string[];
  rooms: RoomDraft[];
  photoUrl?: string;
  photoCount: number;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("Tổng quan");
  const startingPrice = lowestRoomPrice(rooms);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Xem trước giao diện
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Cập nhật thời gian thực
        </span>
      </div>

      <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={name || "Ảnh xem trước khách sạn"}
              className="h-full w-full object-cover"
              src={photoUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
              Chưa có ảnh xem trước
            </div>
          )}
          <div className="absolute top-3.5 right-3.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            {photoCount > 0 ? `1/${photoCount} ảnh` : "0 ảnh"}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-5">
          <div className="space-y-3.5">
            <h3 className="text-lg font-bold leading-snug tracking-tight text-slate-900">
              {name || "Tên khách sạn của bạn"}
            </h3>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <svg
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-slate-400 font-normal">
                  Chưa có đánh giá
                </span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-slate-500">
                <svg
                  className="h-3.5 w-3.5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                <span>{provinceName || "Chưa chọn địa điểm"}</span>
              </div>
            </div>

            {address ? (
              <p className="text-xs font-medium text-slate-500">{address}</p>
            ) : null}

            {tagNames.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tagNames.map((tagName) => (
                  <span
                    className="inline-block rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700"
                    key={tagName}
                  >
                    {tagName}
                  </span>
                ))}
              </div>
            ) : null}

            {amenities.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {amenities.map((name, index) => (
                  <span
                    className="inline-block rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700"
                    key={`${name}-${index}`}
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="flex items-center gap-5 border-b border-slate-100 pt-2 text-xs font-semibold">
              {tabs.map((tab) => (
                <button
                  className={`pb-2 transition ${
                    activeTab === tab
                      ? "border-b-2 border-brand-500 font-bold text-brand-500"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  type="button"
                >
                  {tab === "Đánh giá" ? "Đánh giá (0)" : tab}
                </button>
              ))}
            </div>

            {activeTab === "Tổng quan" ? (
              <p className="line-clamp-3 text-[11px] leading-relaxed text-slate-500">
                {description || "Mô tả khách sạn sẽ hiển thị tại đây."}
              </p>
            ) : null}

            {activeTab === "Phòng" ? (
              <div className="space-y-2.5 pt-1">
                {rooms.length > 0 && rooms.some((room) => room.name) ? (
                  rooms.map((room, index) => (
                    <div className="flex gap-2.5" key={index}>
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-600">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">
                          {room.name || `Loại phòng ${index + 1}`}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {room.capacity || 0} khách •{" "}
                          {room.quantity || 0} phòng •{" "}
                          {formatPrice(room.basePrice)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Chưa có loại phòng nào.
                  </p>
                )}
              </div>
            ) : null}

            {activeTab === "Đánh giá" ? (
              <p className="pt-1 text-[11px] text-slate-400">
                Chưa có đánh giá nào cho khách sạn này.
              </p>
            ) : null}
          </div>

          <div className="-mx-5 -mb-5 mt-5 flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-4">
            <div>
              <span className="block text-[10px] font-medium text-slate-400">
                Giá phòng chỉ từ
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900">
                  {formatPrice(startingPrice)}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  / đêm
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25">
              {rooms.length} loại phòng
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
