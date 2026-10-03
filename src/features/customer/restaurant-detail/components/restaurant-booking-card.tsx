"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/features/customer/components/cards/card-parts";
import { minMenuPrice, type RestaurantDetail } from "../lib/restaurant-detail";

const fieldBox =
  "flex items-center gap-3 rounded border border-new-chip bg-white px-5 py-2.5";
const dateInput =
  "w-full border-0 bg-transparent p-0 text-sm font-medium text-new-title focus:ring-0";
const stepBtn =
  "flex size-8 cursor-pointer items-center justify-center rounded-full border border-new-input-border text-new-title disabled:opacity-40";

export function RestaurantBookingCard({
  restaurant,
}: {
  restaurant: RestaurantDetail;
}) {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState(restaurant.timeSlots[0]?.startTime ?? "");
  const [guests, setGuests] = useState(2);
  const [open, setOpen] = useState(false);
  const max = Math.max(1, restaurant.capacity);
  const mapUrl =
    restaurant.latitude != null && restaurant.longitude != null
      ? `https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`
      : null;

  return (
    <div className="sticky top-4 rounded-lg bg-new-chip p-6">
      <div className="flex flex-col gap-0.5 border-b border-new-paragraph/30 pb-6">
        <div className="flex items-end gap-2.5">
          <p>Món từ</p>
          <p className="text-2xl font-bold text-new-title">
            {formatPrice(minMenuPrice(restaurant.menu))}
          </p>
        </div>
        <p className="text-new-title">Giá theo thực đơn của nhà hàng</p>
      </div>

      <h4 className="pt-6 pb-5 text-lg font-bold text-new-title lg:text-2xl">
        Đặt bàn
      </h4>

      <label className={`${fieldBox} mb-3`}>
        <span aria-hidden className="material-symbols-outlined">
          calendar_month
        </span>
        <span className="sr-only">Ngày</span>
        <input
          className={dateInput}
          onChange={(e) => setDate(e.target.value)}
          type="date"
          value={date}
        />
      </label>

      <label className={`${fieldBox} mb-3`}>
        <span aria-hidden className="material-symbols-outlined">
          schedule
        </span>
        <span className="sr-only">Giờ</span>
        <select
          className="w-full border-0 bg-transparent p-0 font-medium text-new-title focus:ring-0"
          disabled={restaurant.timeSlots.length === 0}
          onChange={(e) => setSlot(e.target.value)}
          value={slot}
        >
          {restaurant.timeSlots.length === 0 && (
            <option value="">Chưa có khung giờ</option>
          )}
          {restaurant.timeSlots.map((s) => (
            <option key={s.startTime} value={s.startTime}>
              {s.startTime} - {s.endTime}
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
                  className={stepBtn}
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
                  className={stepBtn}
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

      {mapUrl && (
        <Link
          className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-new-teal px-7 py-3.5 font-bold text-white transition-colors hover:bg-new-teal-hover"
          href={mapUrl}
          rel="noreferrer"
          target="_blank"
        >
          <span aria-hidden className="material-symbols-outlined">
            map
          </span>
          Xem bản đồ
        </Link>
      )}

      <button
        className="mt-6 w-full cursor-pointer rounded bg-new-teal px-7 py-3.5 font-bold text-white transition-colors hover:bg-new-teal-hover disabled:cursor-not-allowed disabled:opacity-50"
        disabled={restaurant.timeSlots.length === 0 || !date}
        type="button"
      >
        Kiểm tra bàn trống
      </button>

      <div className="pt-6">
        <h4 className="pb-1.5 font-bold text-new-title lg:text-lg">
          Hủy miễn phí
        </h4>
        <p className="text-new-paragraph">Trước giờ đặt bàn 2 giờ</p>
      </div>
    </div>
  );
}
