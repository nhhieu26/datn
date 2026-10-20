import type { BookingStatus } from "@/generated/prisma/enums";
import type { CalendarDay, CalendarEvent } from "./types";

const DAY = 86_400_000;
const GRID_SIZE = 42; // 6 tuần

/** Ngày dạng YYYY-MM-DD; các cột ngày của đơn đặt được lưu lúc 00:00 UTC. */
export const toIsoDay = (date: Date) => date.toISOString().slice(0, 10);

const parseIsoDay = (iso: string) => new Date(`${iso}T00:00:00Z`);

/** 09/10 */
export const formatDayMonth = (iso: string) =>
  `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export function formatMonthTitle(month: string) {
  return `Tháng ${Number(month.slice(5, 7))}, ${month.slice(0, 4)}`;
}

export function shiftMonth(month: string, offset: number) {
  const [year, m] = month.split("-").map(Number);
  return toIsoDay(new Date(Date.UTC(year, m - 1 + offset, 1))).slice(0, 7);
}

export const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/** Lưới 6 tuần bắt đầu từ thứ Hai, chứa trọn tháng `month` (YYYY-MM). */
export function buildMonthGrid(month: string) {
  const first = parseIsoDay(`${month}-01`).getTime();
  const weekday = (new Date(first).getUTCDay() + 6) % 7; // thứ Hai = 0
  const start = first - weekday * DAY;
  return {
    days: Array.from({ length: GRID_SIZE }, (_, i) =>
      toIsoDay(new Date(start + i * DAY)),
    ),
    from: new Date(start),
    to: new Date(start + GRID_SIZE * DAY),
  };
}

/** Mỗi đơn xuất hiện trên mọi ngày trong [start, end). */
export function buildCalendarDays(
  days: string[],
  events: CalendarEvent[],
  { month, selected, today }: { month: string; selected: string; today: string },
): CalendarDay[] {
  const byDay = new Map<string, CalendarEvent[]>(days.map((d) => [d, []]));
  for (const event of events) {
    for (
      let t = parseIsoDay(event.start).getTime();
      t < parseIsoDay(event.end).getTime();
      t += DAY
    ) {
      byDay.get(toIsoDay(new Date(t)))?.push(event);
    }
  }
  return days.map((iso) => ({
    iso,
    day: Number(iso.slice(8, 10)),
    inMonth: iso.startsWith(month),
    isToday: iso === today,
    isSelected: iso === selected,
    events: byDay.get(iso) ?? [],
  }));
}

export const nextIsoDay = (iso: string) =>
  toIsoDay(new Date(parseIsoDay(iso).getTime() + DAY));

type StatusGroup = {
  key: "pending" | "confirmed" | "cancelled";
  label: string;
  statuses: BookingStatus[];
  dotClass: string;
  pillClass: string;
};

/** Nhóm trạng thái hiển thị trên lưới lịch và chú thích. */
export const CALENDAR_STATUS_GROUPS: StatusGroup[] = [
  {
    key: "confirmed",
    label: "Đã xác nhận",
    statuses: ["paid", "confirmed", "completed"],
    dotClass: "bg-teal-500",
    pillClass: "border-teal-200 bg-teal-50 text-teal-800",
  },
  {
    key: "pending",
    label: "Chờ xác nhận",
    statuses: ["pending_confirmation"],
    dotClass: "bg-yellow-500",
    pillClass: "border-yellow-200 bg-yellow-50 text-yellow-800",
  },
  {
    key: "cancelled",
    label: "Đã hủy",
    statuses: ["cancelled", "no_show"],
    dotClass: "bg-red-500",
    pillClass: "border-red-200 bg-red-50 text-red-800",
  },
];

export function groupEventsByStatus(events: CalendarEvent[]) {
  return CALENDAR_STATUS_GROUPS.map((group) => ({
    ...group,
    count: events.filter((e) => group.statuses.includes(e.status)).length,
  })).filter((group) => group.count > 0);
}
