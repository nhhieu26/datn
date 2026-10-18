"use client";

import {
  DATE_RANGE_OPTIONS,
  type DateRange,
} from "@/features/provider/components/list-controls";
import { BookingIcon } from "@/features/provider/tour-bookings/components/booking-icon";
import {
  PrelineBookingActions,
  PrelineStatusBadge,
  layerButtonClass,
} from "@/features/provider/tour-bookings/components/tour-booking-status";
import {
  Pagination,
  inputClass,
} from "@/features/provider/tour-bookings/components/tour-bookings-table";
import {
  formatDate,
  formatRelativeTime,
  reservationInstant,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { updateRestaurantBookingStatusAction } from "../actions";
import {
  buildRestaurantBookingsUrl,
  type RestaurantBookingsQuery,
} from "../search-params";
import type { RestaurantBookingListItem } from "../types";
import {
  RESTAURANT_PROVIDER_TRANSITIONS,
  RESTAURANT_STATUS_OPTIONS,
  formatTimeRange,
} from "../utils";

type HSWindow = Window & {
  HSDropdown?: { autoInit: () => void };
};

function BookingRow({ booking }: { booking: RestaurantBookingListItem }) {
  const completedBlocked =
    reservationInstant(booking.reservationDate, booking.startTime) >
    new Date();

  return (
    <tr className="hover:bg-layer-hover">
      <td className="min-w-80 px-6 py-4 align-middle">
        <div className="flex items-center gap-x-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={booking.restaurantName}
            className="size-11 shrink-0 rounded-lg object-cover"
            src={booking.imageUrl}
          />
          <div className="min-w-0 grow">
            <span className="block truncate text-sm font-semibold text-foreground">
              {booking.customerName}
            </span>
            <span className="mt-0.5 line-clamp-1 text-sm text-primary">
              {booking.restaurantName}
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground-1">
              {booking.customerEmail} · {booking.customerPhone}
            </span>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 align-middle whitespace-nowrap">
        <span className="block text-sm font-medium text-foreground">
          {formatDate(booking.reservationDate)}
        </span>
        <span className="mt-0.5 flex items-center gap-x-1.5 text-xs text-muted-foreground-1">
          <BookingIcon name="clock" className="size-3.5 text-muted-foreground" />
          {formatTimeRange(booking.startTime, booking.endTime)}
        </span>
      </td>

      <td className="px-6 py-4 align-middle whitespace-nowrap">
        <span className="flex items-center gap-x-1.5 text-sm font-medium text-foreground">
          <BookingIcon name="users" className="size-4 text-muted-foreground" />
          {booking.guests} khách
        </span>
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
            noun: "đặt bàn",
            subtitle: booking.restaurantName,
            cancelEffect: `trả lại ${booking.guests} chỗ cho khung giờ đã đặt`,
            completeBlockedHint: completedBlocked
              ? "Chưa qua giờ đặt bàn"
              : null,
            transitions: RESTAURANT_PROVIDER_TRANSITIONS,
            descriptions: {
              confirmed:
                "Khách hàng sẽ thấy đơn đặt bàn đã được nhà hàng xác nhận. Bạn vẫn có thể hủy đơn sau khi xác nhận.",
              completed:
                "Đánh dấu đơn đã phục vụ xong sau giờ đặt bàn. Đơn sẽ kết thúc ở trạng thái hoàn thành.",
              cancelled: `Đơn sẽ bị hủy và trả lại ${booking.guests} chỗ cho khung giờ đã đặt. Lý do hủy sẽ được gửi cho khách. Thao tác không thể hoàn tác.`,
            },
            onSubmit: updateRestaurantBookingStatusAction,
          }}
          detailHref={`/provider/bookings/restaurants/${encodeURIComponent(booking.code)}`}
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
          <BookingIcon name="utensils" className="size-6" />
        </span>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Chưa có đơn đặt bàn nào
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground-1">
          Khi khách hàng đặt bàn tại nhà hàng của bạn, đơn đặt chỗ sẽ xuất hiện
          tại đây.
        </p>
      </div>
    </div>
  );
}

const SEARCH_DEBOUNCE_MS = 400;

type RestaurantBookingsTableProps = {
  bookings: RestaurantBookingListItem[];
  query: RestaurantBookingsQuery;
  restaurantNames: string[];
  hasFilters: boolean;
  hasAnyBooking: boolean;
  total: number;
  page: number;
  pageSize: number;
};

export function RestaurantBookingsTable({
  bookings,
  query,
  restaurantNames,
  hasAnyBooking,
  total,
  page,
  pageSize,
}: RestaurantBookingsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState(query.q);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function apply(patch: Partial<RestaurantBookingsQuery>) {
    startTransition(() => {
      router.replace(buildRestaurantBookingsUrl(query, patch), {
        scroll: false,
      });
    });
  }

  useEffect(() => {
    if (isPending) return;
    const next = keyword.trim();
    if (next === query.q) return;
    const timer = setTimeout(() => {
      searchTimerRef.current = null;
      startTransition(() => {
        router.replace(buildRestaurantBookingsUrl(query, { q: next }), {
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
          <label className="sr-only" htmlFor="hs-restaurant-bookings-search">
            Tìm kiếm đơn đặt
          </label>
          <input
            className={`${inputClass} w-full ps-10 pe-4`}
            id="hs-restaurant-bookings-search"
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tên khách, nhà hàng, email, SĐT..."
            type="text"
            value={keyword}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Lọc theo nhà hàng"
            className={`${inputClass} max-w-56 truncate ps-3 pe-9`}
            onChange={(event) => apply({ restaurant: event.target.value })}
            value={query.restaurant}
          >
            <option value="">Tất cả nhà hàng</option>
            {restaurantNames.map((name) => (
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
                status: event.target.value as RestaurantBookingsQuery["status"],
              })
            }
            value={query.status}
          >
            <option value="all">Tất cả trạng thái</option>
            {RESTAURANT_STATUS_OPTIONS.map((option) => (
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
                { label: "Khách hàng & Nhà hàng", align: "text-start" },
                { label: "Ngày & giờ", align: "text-start" },
                { label: "Số khách", align: "text-start" },
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
                  colSpan={6}
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
            href={(p) => buildRestaurantBookingsUrl(query, { page: p })}
            page={page}
            totalPages={Math.ceil(total / pageSize)}
          />
        </div>
      ) : null}
    </div>
  );
}
