import { todayIsoDate } from "@/lib/utils";

export type CalendarQuery = {
  /** YYYY-MM */
  month: string;
  /** YYYY-MM-DD, luôn thuộc `month`. */
  date: string;
};

type RawParams = Record<string, string | string[] | undefined>;

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

// Loại các ngày như 2026-02-30 mà regex vẫn chấp nhận
function isRealDate(value: string) {
  return (
    DATE_PATTERN.test(value) &&
    new Date(`${value}T00:00:00Z`).toISOString().startsWith(value)
  );
}

export function parseCalendarQuery(
  params: RawParams,
  today = todayIsoDate(),
): CalendarQuery {
  const rawDate = first(params.date);
  const rawMonth = first(params.month);
  const date = isRealDate(rawDate) ? rawDate : null;

  const month = MONTH_PATTERN.test(rawMonth)
    ? rawMonth
    : (date ?? today).slice(0, 7);

  if (date?.startsWith(month)) return { month, date };
  return { month, date: today.startsWith(month) ? today : `${month}-01` };
}

export function buildCalendarUrl(
  slug: string,
  query: Partial<CalendarQuery> = {},
) {
  const params = new URLSearchParams();
  if (query.month) params.set("month", query.month);
  if (query.date) params.set("date", query.date);
  const search = params.toString();
  return `/provider/calendar/${slug}${search ? `?${search}` : ""}`;
}
