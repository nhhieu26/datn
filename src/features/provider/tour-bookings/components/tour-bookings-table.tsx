"use client";

import {
  DATE_RANGE_OPTIONS,
  type DateRange,
} from "@/features/provider/components/list-controls";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  hasTourEnded,
} from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { updateTourBookingStatusAction } from "../actions";
import { buildTourBookingsUrl, type TourBookingsQuery } from "../search-params";
import type { TourBookingListItem } from "../types";
import { BOOKING_STATUS_OPTIONS } from "../utils";
import { BookingIcon } from "./booking-icon";
import {
  PrelineBookingActions,
  PrelinePaymentBadge,
  PrelineStatusBadge,
  layerButtonClass,
} from "./tour-booking-status";

type HSWindow = Window & {
  HSDropdown?: { autoInit: () => void };
};

export const inputClass =
  "block rounded-lg border-layer-line bg-layer py-2 text-foreground placeholder:text-muted-foreground-1 focus:border-primary-focus focus:ring-primary-focus sm:text-sm";

const pageButtonClass =
  "flex min-h-9.5 min-w-9.5 items-center justify-center rounded-lg px-2.5 py-2 text-sm focus:outline-hidden";

function BookingRow({ booking }: { booking: TourBookingListItem }) {
  return (
    <tr className="hover:bg-layer-hover">
      <td className="min-w-80 px-6 py-4 align-middle">
        <div className="flex items-center gap-x-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={booking.tourTitle}
            className="size-11 shrink-0 rounded-lg object-cover"
            src={booking.tourImageUrl}
          />
          <div className="min-w-0 grow">
            <span className="block truncate text-sm font-semibold text-foreground">
              {booking.customerName}
            </span>
            <span className="mt-0.5 line-clamp-1 text-sm text-primary">
              {booking.tourTitle}
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground-1">
              {booking.customerEmail} · {booking.customerPhone}
            </span>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 align-middle whitespace-nowrap">
        <span className="inline-flex items-center gap-x-1.5 text-sm font-medium text-foreground">
          <BookingIcon name="users" className="size-4 text-muted-foreground" />
          {booking.guests}
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
            noun: "đặt tour",
            subtitle: booking.tourTitle,
            cancelEffect: `trả lại ${booking.guests} chỗ cho lịch khởi hành`,
            completeBlockedHint: hasTourEnded(booking.tourEndsAt)
              ? null
              : "Tour chưa kết thúc",
            onSubmit: updateTourBookingStatusAction,
          }}
          detailHref={`/provider/bookings/tours/${encodeURIComponent(booking.code)}`}
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
          <BookingIcon name="ticket" className="size-6" />
        </span>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Chưa có đơn đặt tour nào
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground-1">
          Khi khách hàng đặt tour của bạn, đơn đặt chỗ sẽ xuất hiện tại đây.
        </p>
      </div>
    </div>
  );
}

function pageList(page: number, totalPages: number): (number | "gap")[] {
  const pages = new Set(
    [1, totalPages, page - 1, page, page + 1].filter(
      (p) => p >= 1 && p <= totalPages,
    ),
  );
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

export function Pagination({
  page,
  totalPages,
  href,
}: {
  page: number;
  totalPages: number;
  href: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const arrowClass = `${pageButtonClass} text-foreground hover:bg-muted-hover focus:bg-muted-focus`;
  const disabledArrowClass = `${pageButtonClass} pointer-events-none text-foreground opacity-50`;

  return (
    <nav aria-label="Phân trang" className="flex items-center gap-x-1">
      {page > 1 ? (
        <Link
          aria-label="Trang trước"
          className={arrowClass}
          href={href(page - 1)}
          scroll={false}
        >
          <BookingIcon name="chevronLeft" className="size-3.5" />
        </Link>
      ) : (
        <span aria-hidden="true" className={disabledArrowClass}>
          <BookingIcon name="chevronLeft" className="size-3.5" />
        </span>
      )}
      {pageList(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span
            key={`gap-${i}`}
            className={`${pageButtonClass} text-muted-foreground-1`}
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            aria-current={p === page ? "page" : undefined}
            className={`${pageButtonClass} px-3 ${
              p === page
                ? "bg-surface text-surface-foreground focus:bg-surface-focus"
                : "text-foreground hover:bg-muted-hover focus:bg-muted-focus"
            }`}
            href={href(p)}
            scroll={false}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link
          aria-label="Trang sau"
          className={arrowClass}
          href={href(page + 1)}
          scroll={false}
        >
          <BookingIcon name="chevronRight" className="size-3.5" />
        </Link>
      ) : (
        <span aria-hidden="true" className={disabledArrowClass}>
          <BookingIcon name="chevronRight" className="size-3.5" />
        </span>
      )}
    </nav>
  );
}

const SEARCH_DEBOUNCE_MS = 400;

type TourBookingsTableProps = {
  bookings: TourBookingListItem[];
  query: TourBookingsQuery;
  tourTitles: string[];
  hasFilters: boolean;
  hasAnyBooking: boolean;
  total: number;
  page: number;
  pageSize: number;
};

export function TourBookingsTable({
  bookings,
  query,
  tourTitles,
  hasAnyBooking,
  total,
  page,
  pageSize,
}: TourBookingsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState(query.q);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function apply(patch: Partial<TourBookingsQuery>) {
    startTransition(() => {
      router.replace(buildTourBookingsUrl(query, patch), { scroll: false });
    });
  }

  useEffect(() => {
    if (isPending) return;
    const next = keyword.trim();
    if (next === query.q) return;
    const timer = setTimeout(() => {
      searchTimerRef.current = null;
      startTransition(() => {
        router.replace(buildTourBookingsUrl(query, { q: next }), {
          scroll: false,
        });
      });
    }, SEARCH_DEBOUNCE_MS);
    searchTimerRef.current = timer;
    return () => {
      clearTimeout(timer);
      searchTimerRef.current = null;
    };
  }, [isPending, keyword, query, router]);

  function handleReset() {
    if (searchTimerRef.current !== null) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
    setKeyword("");
    startTransition(() => {
      router.replace("?", { scroll: false });
      router.refresh();
    });
  }

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
          <label className="sr-only" htmlFor="hs-tour-bookings-search">
            Tìm kiếm đơn đặt
          </label>
          <input
            className={`${inputClass} w-full ps-10 pe-4`}
            id="hs-tour-bookings-search"
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tên khách, tên tour, email, SĐT..."
            type="text"
            value={keyword}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Lọc theo tour"
            className={`${inputClass} max-w-56 truncate ps-3 pe-9`}
            onChange={(event) => apply({ tour: event.target.value })}
            value={query.tour}
          >
            <option value="">Tất cả tour</option>
            {tourTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
          <select
            aria-label="Lọc theo trạng thái"
            className={`${inputClass} ps-3 pe-9`}
            onChange={(event) =>
              apply({
                status: event.target.value as TourBookingsQuery["status"],
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
            aria-busy={isPending}
            className={`px-3 py-2 ${layerButtonClass}`}
            disabled={isPending}
            onClick={handleReset}
            title="Đặt lại bộ lọc và làm mới dữ liệu"
            type="button"
          >
            <BookingIcon
              name="reset"
              className={isPending ? "size-4 shrink-0 animate-spin" : undefined}
            />
            {isPending ? "Đang tải…" : "Đặt lại"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-table-line">
          <thead className="bg-muted">
            <tr>
              {[
                { label: "Khách hàng & Tour", align: "text-start" },
                { label: "Số khách", align: "text-start" },
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
                  colSpan={7}
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
            href={(p) => buildTourBookingsUrl(query, { page: p })}
            page={page}
            totalPages={Math.ceil(total / pageSize)}
          />
        </div>
      ) : null}
    </div>
  );
}
