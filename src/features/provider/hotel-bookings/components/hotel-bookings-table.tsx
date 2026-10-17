"use client";

import {
  DATE_RANGE_OPTIONS,
  type DateRange,
} from "@/features/provider/components/list-controls";
import { BookingIcon } from "@/features/provider/tour-bookings/components/booking-icon";
import {
  PrelineBookingActions,
  PrelinePaymentBadge,
  PrelineStatusBadge,
  layerButtonClass,
} from "@/features/provider/tour-bookings/components/tour-booking-status";
import {
  Pagination,
  inputClass,
} from "@/features/provider/tour-bookings/components/tour-bookings-table";
import { BOOKING_STATUS_OPTIONS } from "@/features/provider/tour-bookings/utils";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  hasCheckedOut,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updateHotelBookingStatusAction } from "../actions";
import {
  buildHotelBookingsUrl,
  type HotelBookingsQuery,
} from "../search-params";
import type { HotelBookingListItem } from "../types";

type HSWindow = Window & {
  HSDropdown?: { autoInit: () => void };
};

function BookingRow({ booking }: { booking: HotelBookingListItem }) {
  return (
    <tr className="hover:bg-layer-hover">
      <td className="min-w-80 px-6 py-4 align-middle">
        <div className="flex items-center gap-x-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={booking.roomName}
            className="size-11 shrink-0 rounded-lg object-cover"
            src={booking.imageUrl}
          />
          <div className="min-w-0 grow">
            <span className="block truncate text-sm font-semibold text-foreground">
              {booking.customerName}
            </span>
            <span className="mt-0.5 line-clamp-1 text-sm text-primary">
              {booking.hotelName} · {booking.roomName}
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground-1">
              {booking.customerEmail} · {booking.customerPhone}
            </span>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 align-middle whitespace-nowrap">
        <span className="block text-sm font-medium text-foreground">
          {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
        </span>
        <span className="block text-xs text-muted-foreground-1">
          {booking.nights} đêm
        </span>
      </td>

      <td className="px-6 py-4 align-middle whitespace-nowrap">
        <span className="flex items-center gap-x-1.5 text-sm font-medium text-foreground">
          <BookingIcon name="bed" className="size-4 text-muted-foreground" />
          {booking.roomQuantity} phòng
        </span>
        <span className="mt-0.5 flex items-center gap-x-1.5 text-xs text-muted-foreground-1">
          <BookingIcon name="users" className="size-4 text-muted-foreground" />
          {booking.guests} khách
        </span>
      </td>

      <td className="px-6 py-4 text-end align-middle whitespace-nowrap">
        <span className="block text-sm font-medium text-foreground">
          {formatCurrency(booking.totalAmount)}
        </span>
        <span className="block text-xs text-muted-foreground-1">
          Thực nhận {formatCurrency(booking.providerAmount)}
        </span>
      </td>

      <td className="px-6 py-4 align-middle">
        <PrelinePaymentBadge state={booking.paymentState} />
      </td>

      <td className="px-6 py-4 align-middle">
        <PrelineStatusBadge status={booking.status} />
      </td>

      <td className="px-6 py-4 align-middle whitespace-nowrap">
        <span
          className="block text-sm font-medium text-foreground"
          suppressHydrationWarning
        >
          {formatRelativeTime(booking.createdAt)}
        </span>
        <span className="block text-xs text-muted-foreground-1">
          {formatDate(booking.createdAt)}
        </span>
      </td>

      <td className="px-6 py-4 text-end align-middle whitespace-nowrap">
        <PrelineBookingActions
          booking={booking}
          config={{
            noun: "đặt phòng",
            subtitle: `${booking.hotelName} · ${booking.roomName}`,
            cancelEffect: `mở lại ${booking.roomQuantity} phòng cho khoảng ngày đã đặt`,
            completeBlockedHint: hasCheckedOut(booking.checkOutDate)
              ? null
              : "Chưa đến ngày trả phòng",
            onSubmit: updateHotelBookingStatusAction,
          }}
          detailHref={`/provider/bookings/hotels/${encodeURIComponent(booking.code)}`}
        />
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
      <div className="flex min-h-80 flex-col items-center justify-center p-4 text-center md:p-5">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground-2">
          <BookingIcon name="bed" className="size-6" />
        </span>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Chưa có đơn đặt phòng nào
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground-1">
          Khi khách hàng đặt phòng khách sạn của bạn, đơn đặt chỗ sẽ xuất hiện
          tại đây.
        </p>
      </div>
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

  // Dòng mới hiện ra sau khi lọc/chuyển trang cần được Preline khởi tạo dropdown
  useEffect(() => {
    (window as HSWindow).HSDropdown?.autoInit();
  }, [bookings]);

  if (!hasAnyBooking) return <EmptyState />;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border border-card-line bg-card shadow-2xs transition-opacity ${
        isPending ? "opacity-70" : ""
      }`}
    >
      <div className="grid gap-3 border-b border-card-line px-6 py-4 xl:flex xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 start-0 z-20 flex items-center ps-3.5">
            <BookingIcon
              name="search"
              className="size-4 text-muted-foreground"
            />
          </div>
          <label className="sr-only" htmlFor="hs-hotel-bookings-search">
            Tìm kiếm đơn đặt
          </label>
          <input
            className={`${inputClass} w-full ps-10 pe-4`}
            id="hs-hotel-bookings-search"
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tên khách, khách sạn, phòng, email, SĐT..."
            type="text"
            value={keyword}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Lọc theo khách sạn"
            className={`${inputClass} max-w-56 truncate ps-3 pe-9`}
            onChange={(event) => apply({ hotel: event.target.value })}
            value={query.hotel}
          >
            <option value="">Tất cả khách sạn</option>
            {hotelNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            aria-label="Lọc theo trạng thái"
            className={`${inputClass} ps-3 pe-9`}
            onChange={(event) =>
              apply({
                status: event.target.value as HotelBookingsQuery["status"],
              })
            }
            value={query.status}
          >
            <option value="all">Tất cả trạng thái</option>
            {BOOKING_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Lọc theo thời gian"
            className={`${inputClass} ps-3 pe-9`}
            onChange={(event) =>
              apply({ range: event.target.value as DateRange })
            }
            value={query.range}
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {query.range === "custom" ? (
            <div className="flex items-center gap-x-2">
              <input
                aria-label="Từ ngày"
                className={`${inputClass} px-3`}
                max={query.to || undefined}
                onChange={(event) => apply({ from: event.target.value })}
                type="date"
                value={query.from}
              />
              <BookingIcon
                name="arrowRight"
                className="size-4 text-muted-foreground"
              />
              <input
                aria-label="Đến ngày"
                className={`${inputClass} px-3`}
                min={query.from || undefined}
                onChange={(event) => apply({ to: event.target.value })}
                type="date"
                value={query.to}
              />
            </div>
          ) : null}
          <button
            className={`px-3 py-2 ${layerButtonClass}`}
            disabled={!hasFilters && keyword === ""}
            onClick={() => {
              setKeyword("");
              startTransition(() => {
                router.replace("?", { scroll: false });
              });
            }}
            type="button"
          >
            <BookingIcon name="reset" />
            Đặt lại
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-table-line">
          <thead className="bg-muted">
            <tr>
              {[
                { label: "Khách hàng & Phòng", align: "text-start" },
                { label: "Lưu trú", align: "text-start" },
                { label: "Phòng / Khách", align: "text-start" },
                { label: "Tổng tiền", align: "text-end" },
                { label: "Thanh toán", align: "text-start" },
                { label: "Trạng thái", align: "text-start" },
                { label: "Ngày đặt", align: "text-start" },
                { label: "Thao tác", align: "text-end" },
              ].map((column) => (
                <th
                  key={column.label}
                  className={`px-6 py-3 whitespace-nowrap ${column.align}`}
                  scope="col"
                >
                  <span className="text-xs font-semibold text-foreground uppercase">
                    {column.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-table-line">
            {bookings.length === 0 ? (
              <tr>
                <td
                  className="px-6 py-10 text-center text-sm text-muted-foreground-1"
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
        <div className="grid gap-3 border-t border-card-line px-6 py-4 md:flex md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground-1">
            Hiển thị{" "}
            <span className="font-semibold text-foreground">
              {(page - 1) * pageSize + 1} -{" "}
              {(page - 1) * pageSize + bookings.length}
            </span>{" "}
            / {total} đơn
          </p>
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
