import type { RestaurantBookingFilter } from "@/entities/restaurant-booking";
import type { DateRange } from "@/features/provider/components/list-controls";
import type { BookingStatus } from "@/generated/prisma/enums";
import { RESTAURANT_STATUS_OPTIONS } from "./utils";

export const RESTAURANT_BOOKINGS_PAGE_SIZE = 10;

export type RestaurantBookingsQuery = {
  q: string;
  restaurant: string;
  status: BookingStatus | "all";
  range: DateRange;
  from: string;
  to: string;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const RANGES: DateRange[] = ["all", "7d", "30d", "12m", "custom"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// Ngày người dùng chọn được hiểu theo giờ Việt Nam bất kể múi giờ server
const TIME_ZONE_OFFSET = "+07:00";

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function parseDate(value: string) {
  return DATE_PATTERN.test(value) ? value : "";
}

export function parseRestaurantBookingsQuery(params: RawParams): RestaurantBookingsQuery {
  const status = first(params.status);
  const range = first(params.range);
  return {
    q: first(params.q).trim(),
    restaurant: first(params.restaurant),
    status: RESTAURANT_STATUS_OPTIONS.some((o) => o.value === status)
      ? (status as BookingStatus)
      : "all",
    range: RANGES.includes(range as DateRange) ? (range as DateRange) : "all",
    from: parseDate(first(params.from)),
    to: parseDate(first(params.to)),
    page: Math.max(1, Math.floor(Number(first(params.page))) || 1),
  };
}

export function hasActiveFilters(query: RestaurantBookingsQuery) {
  return (
    query.q !== "" ||
    query.restaurant !== "" ||
    query.status !== "all" ||
    query.range !== "all"
  );
}

export function buildRestaurantBookingsUrl(
  query: RestaurantBookingsQuery,
  patch: Partial<RestaurantBookingsQuery> = {},
) {
  // Đổi bộ lọc thì về trang 1; `page` chỉ giữ khi được truyền trong patch
  const next = { ...query, page: 1, ...patch };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.restaurant) params.set("restaurant", next.restaurant);
  if (next.status !== "all") params.set("status", next.status);
  if (next.range !== "all") params.set("range", next.range);
  if (next.range === "custom") {
    if (next.from) params.set("from", next.from);
    if (next.to) params.set("to", next.to);
  }
  if (next.page > 1) params.set("page", String(next.page));
  const search = params.toString();
  return search ? `?${search}` : "?";
}

export function toRestaurantBookingFilter(
  query: RestaurantBookingsQuery,
): RestaurantBookingFilter {
  let createdFrom: Date | undefined;
  let createdTo: Date | undefined;

  if (query.range === "custom") {
    if (query.from) {
      createdFrom = new Date(`${query.from}T00:00:00${TIME_ZONE_OFFSET}`);
    }
    if (query.to) {
      createdTo = new Date(`${query.to}T23:59:59.999${TIME_ZONE_OFFSET}`);
    }
  } else if (query.range !== "all") {
    createdFrom = new Date();
    if (query.range === "12m") {
      createdFrom.setMonth(createdFrom.getMonth() - 12);
    } else {
      createdFrom.setDate(
        createdFrom.getDate() - (query.range === "7d" ? 7 : 30),
      );
    }
  }

  return {
    q: query.q || undefined,
    restaurantName: query.restaurant || undefined,
    status: query.status === "all" ? undefined : query.status,
    createdFrom:
      createdFrom && !Number.isNaN(createdFrom.getTime())
        ? createdFrom
        : undefined,
    createdTo:
      createdTo && !Number.isNaN(createdTo.getTime()) ? createdTo : undefined,
  };
}
