"use client";

import {
  DATE_RANGE_OPTIONS,
  FilterSelect,
  Pagination,
  dateInputClass,
  type DateRange,
} from "@/features/provider/components/list-controls";
import {
  PaymentBadge,
  StatusBadge,
} from "@/features/provider/tour-bookings/components/booking-badges";
import { BOOKING_STATUS_OPTIONS } from "@/features/provider/tour-bookings/utils";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  buildHotelBookingsUrl,
  type HotelBookingsQuery,
} from "../search-params";
import type { HotelBookingListItem } from "../types";

function BookingRow({ booking }: { booking: HotelBookingListItem }) {
  return (
    <tr className="transition-colors hover:bg-slate-50/70">
      <td className="min-w-[340px] px-6 py-5 align-middle">
        <div className="flex items-center gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={booking.roomName}
            className="h-14 w-14 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-slate-200/80"
            src={booking.imageUrl}
          />
          <div className="flex min-w-0 flex-col">
            <span className="text-xs font-semibold text-slate-700">
              {booking.customerName}
            </span>
            <span className="mt-0.5 line-clamp-2 text-sm font-medium text-brand-600">
              {booking.hotelName} · {booking.roomName}
            </span>
            <span className="mt-1 text-xs text-slate-500">
              {booking.customerEmail} / {booking.customerPhone}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-5 align-middle whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-800">
            {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
          </span>
          <span className="mt-0.5 text-xs text-slate-400">
            {booking.nights} đêm
          </span>
        </div>
      </td>
      <td className="px-6 py-5 text-center align-middle whitespace-nowrap">
        <div className="flex flex-col items-center gap-1 text-sm font-semibold text-slate-800">
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-slate-400">
              bed
            </span>
            {booking.roomQuantity}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <span className="material-symbols-outlined text-[14px] text-slate-400">
              group
            </span>
            {booking.guests}
          </span>
        </div>
      </td>
      <td className="px-6 py-5 text-right align-middle whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900">
            {formatCurrency(booking.totalAmount)}
          </span>
          <span className="mt-0.5 text-xs text-slate-400">
            Thực nhận {formatCurrency(booking.providerAmount)}
          </span>
        </div>
      </td>
      <td className="px-6 py-5 align-middle">
        <PaymentBadge state={booking.paymentState} />
      </td>
      <td className="px-6 py-5 align-middle">
        <StatusBadge status={booking.status} />
      </td>
      <td className="px-6 py-5 align-middle whitespace-nowrap">
        <div className="flex flex-col">
          <span
            className="text-sm font-medium text-slate-800"
            suppressHydrationWarning
          >
            {formatRelativeTime(booking.createdAt)}
          </span>
          <span className="mt-0.5 text-xs text-slate-400">
            {formatDate(booking.createdAt)}
          </span>
        </div>
      </td>
      <td className="px-6 py-5 text-right align-middle whitespace-nowrap">
        <Link
          className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          href={`/provider/bookings/hotels/${encodeURIComponent(booking.code)}`}
          title="Xem chi tiết"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "18px" }}
          >
            visibility
          </span>
        </Link>
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200/80 bg-white p-12 text-center shadow-sm">
      <span className="material-symbols-outlined text-[40px] text-slate-300">
        hotel
      </span>
      <h3 className="text-base font-bold text-slate-900">
        Chưa có đơn đặt phòng nào
      </h3>
      <p className="max-w-sm text-sm text-slate-500">
        Khi khách hàng đặt phòng khách sạn của bạn, đơn đặt chỗ sẽ xuất hiện
        tại đây.
      </p>
    </div>
  );
}

const SEARCH_DEBOUNCE_MS = 400;

type HotelBookingsTableProps = {
  bookings: HotelBookingListItem[];
  query: HotelBookingsQuery;
  hotelNames: string[];
  hasFilters: boolean;
  hasAnyBooking: boolean;
  total: number;
  page: number;
  pageSize: number;
};

export function HotelBookingsTable({
  bookings,
  query,
  hotelNames,
  hasFilters,
  hasAnyBooking,
  total,
  page,
  pageSize,
}: HotelBookingsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState(query.q);

  function apply(patch: Partial<HotelBookingsQuery>) {
    startTransition(() => {
      router.replace(buildHotelBookingsUrl(query, patch), { scroll: false });
    });
  }

  useEffect(() => {
    const next = keyword.trim();
    if (next === query.q) return;
    const timer = setTimeout(() => {
      startTransition(() => {
        router.replace(buildHotelBookingsUrl(query, { q: next }), {
          scroll: false,
        });
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [keyword, query, router]);

  if (!hasAnyBooking) return <EmptyState />;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-opacity ${
        isPending ? "opacity-70" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/80 p-4">
        <div className="relative min-w-[200px] flex-1">
          <span className="material-symbols-outlined absolute top-1/2 left-3.5 -translate-y-1/2 text-[20px] text-slate-400">
            search
          </span>
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tên khách, khách sạn, phòng, email, SĐT..."
            type="text"
            value={keyword}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <FilterSelect
            value={query.hotel}
            onChange={(value) => apply({ hotel: value })}
          >
            <option value="">Tất cả khách sạn</option>
            {hotelNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            value={query.status}
            onChange={(value) =>
              apply({ status: value as HotelBookingsQuery["status"] })
            }
          >
            <option value="all">Tất cả trạng thái</option>
            {BOOKING_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            value={query.range}
            onChange={(value) => apply({ range: value as DateRange })}
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
          {query.range === "custom" ? (
            <div className="flex items-center gap-2">
              <input
                aria-label="Từ ngày"
                className={dateInputClass}
                max={query.to || undefined}
                onChange={(event) => apply({ from: event.target.value })}
                type="date"
                value={query.from}
              />
              <span className="text-xs text-slate-400">→</span>
              <input
                aria-label="Đến ngày"
                className={dateInputClass}
                min={query.from || undefined}
                onChange={(event) => apply({ to: event.target.value })}
                type="date"
                value={query.to}
              />
            </div>
          ) : null}
          <button
            className="flex items-center justify-center self-stretch rounded-xl border border-slate-200 px-2.5 text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!hasFilters && keyword === ""}
            onClick={() => {
              setKeyword("");
              startTransition(() => {
                router.replace("?", { scroll: false });
              });
            }}
            title="Đặt lại bộ lọc"
            type="button"
          >
            <span className="material-symbols-outlined block text-[18px]">
              refresh
            </span>
          </button>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200/70 bg-slate-50/80 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <th className="px-6 py-4" scope="col">Khách hàng &amp; Phòng</th>
              <th className="px-6 py-4" scope="col">Lưu trú</th>
              <th className="px-6 py-4 text-center" scope="col">Phòng / Khách</th>
              <th className="px-6 py-4 text-right" scope="col">Tổng tiền</th>
              <th className="px-6 py-4" scope="col">Thanh toán</th>
              <th className="px-6 py-4" scope="col">Trạng thái</th>
              <th className="px-6 py-4" scope="col">Ngày đặt</th>
              <th className="px-6 py-4 text-right" scope="col">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {bookings.length === 0 ? (
              <tr>
                <td
                  className="px-6 py-10 text-center text-sm text-slate-500"
                  colSpan={8}
                >
                  Không tìm thấy đơn đặt phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))
            )}
          </tbody>
        </table>
      </div>
      {total > 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 px-6 py-4 sm:flex-row">
          <span className="text-xs text-slate-500">
            Hiển thị {(page - 1) * pageSize + 1}–
            {(page - 1) * pageSize + bookings.length} trong {total} đơn
          </span>
          <Pagination
            href={(p) => buildHotelBookingsUrl(query, { page: p })}
            page={page}
            totalPages={Math.ceil(total / pageSize)}
          />
        </div>
      ) : null}
    </div>
  );
}
