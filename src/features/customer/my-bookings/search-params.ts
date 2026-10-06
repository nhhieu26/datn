import type { BookingStatus } from "@/generated/prisma/enums";

export const MY_BOOKINGS_PAGE_SIZE = 10;

const ALL_TABS = [
  { key: "all", label: "Tất cả", statuses: undefined },
  { key: "pending", label: "Chờ thanh toán", statuses: ["pending_payment"] },
  {
    key: "awaiting",
    label: "Chờ xác nhận",
    statuses: ["pending_confirmation"],
  },
  { key: "paid", label: "Đã thanh toán", statuses: ["paid"] },
  { key: "confirmed", label: "Đã xác nhận", statuses: ["confirmed"] },
  { key: "completed", label: "Hoàn thành", statuses: ["completed"] },
  {
    key: "cancelled",
    label: "Đã hủy",
    statuses: ["cancelled", "expired", "no_show"],
  },
] as const satisfies readonly {
  key: string;
  label: string;
  statuses: readonly BookingStatus[] | undefined;
}[];

export type MyBookingsTab = (typeof ALL_TABS)[number]["key"];

type MyBookingsTabDef = (typeof ALL_TABS)[number];

// Tour / khách sạn thanh toán trước nên không có bước chờ xác nhận
export const MY_BOOKINGS_TABS: readonly MyBookingsTabDef[] = ALL_TABS.filter(
  (t) => t.key !== "awaiting",
);

// Đơn đặt bàn không thanh toán nên bỏ các tab chờ thanh toán / đã thanh toán
export const MY_RESTAURANT_BOOKINGS_TABS: readonly MyBookingsTabDef[] =
  ALL_TABS.filter((t) => t.key !== "pending" && t.key !== "paid");

export type MyBookingsQuery = { tab: MyBookingsTab; page: number };

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseMyBookingsQuery(
  params: RawParams,
  tabs: readonly MyBookingsTabDef[] = MY_BOOKINGS_TABS,
): MyBookingsQuery {
  const tab = first(params.tab);
  return {
    tab: tabs.some((t) => t.key === tab)
      ? (tab as MyBookingsTab)
      : "all",
    page: Math.max(1, Math.floor(Number(first(params.page))) || 1),
  };
}

export function buildMyBookingsUrl(
  query: MyBookingsQuery,
  patch: Partial<MyBookingsQuery> = {},
) {
  // Đổi tab thì về trang 1; `page` chỉ giữ khi được truyền trong patch
  const next = { ...query, page: 1, ...patch };
  const params = new URLSearchParams();
  if (next.tab !== "all") params.set("tab", next.tab);
  if (next.page > 1) params.set("page", String(next.page));
  const search = params.toString();
  return search ? `?${search}` : "?";
}

export function getTabStatuses(tab: MyBookingsTab): BookingStatus[] | undefined {
  const statuses = ALL_TABS.find((t) => t.key === tab)?.statuses;
  return statuses && [...statuses];
}
