"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/features/customer/components/cards/card-parts";
import type { TourDetail } from "../lib/to-tour-detail";

const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const fieldBox =
  "flex items-center gap-3 rounded border border-new-chip bg-white px-5 py-2.5";

export function TourBookingCard({ tour }: { tour: TourDetail }) {
  const [departureId, setDepartureId] = useState(tour.departures[0]?.id ?? "");
  const [guests, setGuests] = useState(1);
  const [open, setOpen] = useState(false);

  const departure = tour.departures.find((d) => d.id === departureId);
  const max = Math.max(1, departure?.slotsLeft ?? 1);
  const total = (departure?.price ?? tour.basePrice) * guests;

  function selectDeparture(id: string) {
    setDepartureId(id);
    const left = tour.departures.find((d) => d.id === id)?.slotsLeft ?? 1;
    setGuests((g) => Math.min(g, Math.max(1, left)));
  }

  return (
    <div className="sticky top-4 rounded-lg bg-new-chip p-6">
      <div className="flex flex-col gap-0.5 border-b border-new-paragraph/30 pb-6">
        <div className="flex items-end gap-2.5">
          <p>Từ</p>
          <p className="text-2xl font-bold text-new-title">
            {formatPrice(departure?.price ?? tour.basePrice)}
          </p>
        </div>
        <p className="text-new-title">Giá tính theo mỗi khách</p>
      </div>

      <h4 className="pt-6 pb-5 text-lg font-bold text-new-title lg:text-2xl">
        Chọn ngày và số khách
      </h4>

      <label className={`${fieldBox} mb-3`}>
        <span aria-hidden className="material-symbols-outlined">
          event
        </span>
        <select
          className="w-full border-0 bg-transparent p-0 font-medium text-new-title focus:ring-0"
          disabled={tour.departures.length === 0}
          onChange={(e) => selectDeparture(e.target.value)}
          value={departureId}
        >
          {tour.departures.length === 0 && (
            <option value="">Chưa có lịch khởi hành</option>
          )}
          {tour.departures.map((d) => (
            <option key={d.id} value={d.id}>
              {dateFormat.format(new Date(d.date))}
            </option>
          ))}
        </select>
      </label>

      <div className="relative">
        <button
          aria-expanded={open}
          className={`${fieldBox} w-full cursor-pointer text-left`}
          onClick={() => setOpen((o) => !o)}
          type="button"
        >
          <span aria-hidden className="material-symbols-outlined">
            person
          </span>
          <span className="flex-1 font-medium text-new-title">
            {guests} khách
          </span>
          <span aria-hidden className="material-symbols-outlined">
            expand_more
          </span>
        </button>
        {open && (
          <div className="absolute inset-x-0 top-full z-10 mt-2 rounded-lg bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-new-title">Số lượng khách</h4>
                <p className="text-sm text-new-paragraph">Tối đa {max} khách</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  aria-label="Giảm số khách"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-new-input-border text-new-title disabled:opacity-40"
                  disabled={guests <= 1}
                  onClick={() => setGuests((g) => g - 1)}
                  type="button"
                >
                  <span aria-hidden className="material-symbols-outlined text-lg">
                    remove
                  </span>
                </button>
                <span className="w-6 text-center font-medium text-new-title">
                  {guests}
                </span>
                <button
                  aria-label="Tăng số khách"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-new-input-border text-new-title disabled:opacity-40"
                  disabled={guests >= max}
                  onClick={() => setGuests((g) => g + 1)}
                  type="button"
                >
                  <span aria-hidden className="material-symbols-outlined text-lg">
                    add
                  </span>
                </button>
              </div>
            </div>
            <button
              className="mt-4 ml-auto block cursor-pointer rounded bg-new-teal px-5 py-1.5 text-sm font-bold text-white hover:bg-new-teal-hover"
              onClick={() => setOpen(false)}
              type="button"
            >
              Xong
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-new-title">
        <span>Tạm tính</span>
        <span className="text-lg font-bold">{formatPrice(total)}</span>
      </div>

      <Link
        aria-disabled={!departure}
        className="mt-4 block w-full rounded bg-new-teal px-7 py-3.5 text-center font-bold text-white transition-colors hover:bg-new-teal-hover aria-disabled:pointer-events-none aria-disabled:opacity-50"
        href={`/booking/tour/${tour.slug}?${new URLSearchParams({
          departureId,
          guests: String(guests),
        })}`}
      >
        Đặt ngay
      </Link>

      <div className="pt-6">
        <h4 className="pb-1.5 font-bold text-new-title lg:text-lg">
          Hủy miễn phí
        </h4>
        <p className="text-new-paragraph">Trước giờ khởi hành 24 giờ</p>
      </div>
    </div>
  );
}
