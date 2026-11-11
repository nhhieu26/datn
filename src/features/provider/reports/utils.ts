import {
  DAY,
  dayLabel,
  fromVn,
  startOfDayVn,
  startOfMonthVn,
  toVn,
  type TimeBuckets,
} from "../dashboard/utils";
import type { ReportRangeQuery } from "./search-params";

/** Khoảng tùy chọn dài hơn số ngày này thì gộp theo tháng cho biểu đồ dễ đọc. */
const MAX_DAILY_BUCKETS = 62;

export type ReportPeriod = {
  label: string;
  current: TimeBuckets;
  /** Kỳ liền trước cùng độ dài, nhãn trùng với kỳ đang xem. */
  previous: TimeBuckets;
};

function dailyEdges(start: Date, days: number) {
  return Array.from({ length: days + 1 }, (_, i) => new Date(start.getTime() + i * DAY));
}

const shift = (edges: Date[], ms: number) => edges.map((d) => new Date(d.getTime() - ms));

/** Toàn bộ khoảng thời gian mà các mốc bao phủ. */
export const bucketRange = ({ edges }: TimeBuckets) => ({
  from: edges[0],
  to: edges[edges.length - 1],
});

function buildPeriod(label: string, labels: string[], current: Date[], previous: Date[]): ReportPeriod {
  return { label, current: { labels, edges: current }, previous: { labels, edges: previous } };
}

function lastDays(days: number, label: string, now: Date): ReportPeriod {
  const start = new Date(startOfDayVn(now).getTime() - (days - 1) * DAY);
  const current = dailyEdges(start, days);
  return buildPeriod(label, current.slice(0, -1).map(dayLabel), current, shift(current, days * DAY));
}

function lastTwelveMonths(now: Date): ReportPeriod {
  const current = Array.from({ length: 13 }, (_, i) => startOfMonthVn(now, i - 11));
  return buildPeriod(
    "12 tháng qua",
    current.slice(0, -1).map((d) => `T${toVn(d).getUTCMonth() + 1}`),
    current,
    Array.from({ length: 13 }, (_, i) => startOfMonthVn(now, i - 23)),
  );
}

function customRange(from: string, to: string): ReportPeriod {
  const parse = (iso: string) => {
    const [year, month, day] = iso.split("-").map(Number);
    return fromVn(year, month - 1, day);
  };
  const start = parse(from);
  const end = new Date(parse(to).getTime() + DAY); // `to` tính trọn ngày
  const span = end.getTime() - start.getTime();
  const days = Math.round(span / DAY);

  const label = `${dayLabel(start)}/${from.slice(0, 4)} – ${dayLabel(parse(to))}/${to.slice(0, 4)}`;

  if (days <= MAX_DAILY_BUCKETS) {
    const current = dailyEdges(start, days);
    return buildPeriod(label, current.slice(0, -1).map(dayLabel), current, shift(current, span));
  }

  const vnStart = toVn(start);
  const current = [start];
  for (let i = 1; ; i++) {
    const edge = fromVn(vnStart.getUTCFullYear(), vnStart.getUTCMonth() + i);
    if (edge >= end) break;
    current.push(edge);
  }
  current.push(end);
  const labels = current.slice(0, -1).map((d) => {
    const vn = toVn(d);
    return `T${vn.getUTCMonth() + 1}/${String(vn.getUTCFullYear()).slice(2)}`;
  });
  return buildPeriod(label, labels, current, shift(current, span));
}

/** Các mốc chia biểu đồ của kỳ đang xem và kỳ liền trước cùng độ dài. */
export function resolveReportPeriod(query: ReportRangeQuery, now = new Date()): ReportPeriod {
  if (query.range === "custom") return customRange(query.from, query.to);
  if (query.range === "12m") return lastTwelveMonths(now);
  if (query.range === "30d") return lastDays(30, "30 ngày qua", now);
  return lastDays(7, "7 ngày qua", now);
}
