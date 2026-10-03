"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/features/customer/components/cards/card-parts";
import type { HotelDetail } from "../lib/to-hotel-detail";

const fieldBox =
  "flex items-center gap-3 rounded border border-new-chip bg-white px-5 py-2.5";
const dateInput =
  "w-full border-0 bg-transparent p-0 text-sm font-medium text-new-title focus:ring-0";
const stepBtn =
  "flex size-8 cursor-pointer items-center justify-center rounded-full border border-new-input-border text-new-title disabled:opacity-40";
const DAY = 86_400_000;

function toTime(s: string) {
  return new Date(`${s}T00:00:00Z`).getTime();
}

export function HotelBookingCard({ hotel }: { hotel: HotelDetail }) {
  const [roomId, setRoomId] = useState(hotel.rooms[0]?.id ?? "");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [open, setOpen] = useState(false);

  const room = hotel.rooms.find((r) => r.id === roomId);
  const max = Math.max(1, room?.capacity ?? 1);
  const mapUrl =
    hotel.latitude != null && hotel.longitude != null
      ? `https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}`
      : null;
  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.round((toTime(checkOut) - toTime(checkIn)) / DAY))
      : 0;
  const price = room?.basePrice ?? hotel.minPrice;

  function selectRoom(id: string) {
    setRoomId(id);
    const cap = hotel.rooms.find((r) => r.id === id)?.capacity ?? 1;
    setGuests((g) => Math.min(g, Math.max(1, cap)));
  }

  return (
    <div className="sticky top-4 rounded-lg bg-new-chip p-6">
      <div className="flex flex-col gap-0.5 border-b border-new-paragraph/30 pb-6">
        <div className="flex items-end gap-2.5">
          <p>Từ</p>
          <p className="text-2xl font-bold text-new-title">
            {formatPrice(price)}
          </p>
        </div>
        <p className="text-new-title">Giá tính theo mỗi đêm</p>
      </div>

      <h4 className="pt-6 pb-5 text-lg font-bold text-new-title lg:text-2xl">
        Chọn phòng và ngày ở
      </h4>

      <label className={`${fieldBox} mb-3`}>
        <span aria-hidden className="material-symbols-outlined">
          bed
        </span>
        <select
          className="w-full border-0 bg-transparent p-0 font-medium text-new-title focus:ring-0"
          disabled={hotel.rooms.length === 0}
          onChange={(e) => selectRoom(e.target.value)}
          value={roomId}
        >
          {hotel.rooms.length === 0 && <option value="">Chưa có phòng</option>}
          {hotel.rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <label className={fieldBox}>
          <span className="sr-only">Nhận phòng</span>
          <input
            className={dateInput}
            onChange={(e) => setCheckIn(e.target.value)}
            type="date"
            value={checkIn}
          />
        </label>
        <label className={fieldBox}>
          <span className="sr-only">Trả phòng</span>
          <input
            className={dateInput}
            min={checkIn || undefined}
            onChange={(e) => setCheckOut(e.target.value)}
            type="date"
            value={checkOut}
          />
        </label>
      </div>

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

      <div className="mt-6 flex items-center justify-between text-new-title">
        <span>
          Tạm tính{nights > 0 ? ` (${nights} đêm)` : ""}
        </span>
        <span className="text-lg font-bold">
          {nights > 0 ? formatPrice(price * nights) : "—"}
        </span>
      </div>

      {mapUrl && (
        <Link
          className="mt-4 flex w-full items-center justify-center gap-2 rounded border border-new-teal bg-transparent px-7 py-3.5 font-bold text-new-teal transition-colors hover:bg-new-teal hover:text-white"
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
        className="mt-4 w-full cursor-pointer rounded bg-new-teal px-7 py-3.5 font-bold text-white transition-colors hover:bg-new-teal-hover disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!room}
        type="button"
      >
        Đặt ngay
      </button>

      <div className="pt-6">
        <h4 className="pb-1.5 font-bold text-new-title lg:text-lg">
          Hủy miễn phí
        </h4>
        <p className="text-new-paragraph">Trước ngày nhận phòng 24 giờ</p>
      </div>
    </div>
  );
}
