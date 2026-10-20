import type { DashboardRange } from "./search-params";

// Việt Nam cố định UTC+7 (không có giờ mùa hè) nên dời mốc thời gian thủ công
const VN_OFFSET = 7 * 3_600_000;
const DAY = 86_400_000;

const toVn = (date: Date) => new Date(date.getTime() + VN_OFFSET);
const fromVn = (year: number, month: number, day = 1) =>
  new Date(Date.UTC(year, month, day) - VN_OFFSET);

/** 0h ngày đầu tháng (giờ VN), `offset` tháng so với tháng của `now`. */
export function startOfMonthVn(now: Date, offset = 0) {
  const vn = toVn(now);
  return fromVn(vn.getUTCFullYear(), vn.getUTCMonth() + offset);
}

/** 0h hôm nay theo giờ VN. */
export function startOfDayVn(now: Date) {
  const vn = toVn(now);
  return fromVn(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate());
}

const pad = (n: number) => String(n).padStart(2, "0");
const dayLabel = (start: Date) => {
  const vn = toVn(start);
  return `${pad(vn.getUTCDate())}/${pad(vn.getUTCMonth() + 1)}`;
};

export type TimeBuckets = {
  labels: string[];
  /** Mốc bắt đầu của từng khoảng, phần tử cuối là mốc kết thúc của khoảng cuối. */
  edges: Date[];
};

/** 12 tháng / 12 tuần (bắt đầu thứ Hai) / 30 ngày gần nhất, tính cả khoảng hiện tại. */
export function buildTimeBuckets(range: DashboardRange, now = new Date()): TimeBuckets {
  if (range === "month") {
    const edges = Array.from({ length: 13 }, (_, i) => startOfMonthVn(now, i - 11));
    const labels = edges.slice(0, -1).map((d) => `T${toVn(d).getUTCMonth() + 1}`);
    return { labels, edges };
  }

  const today = startOfDayVn(now);
  if (range === "week") {
    const weekday = (toVn(today).getUTCDay() + 6) % 7; // thứ Hai = 0
    const monday = today.getTime() - weekday * DAY;
    const edges = Array.from({ length: 13 }, (_, i) => new Date(monday + (i - 11) * 7 * DAY));
    return { labels: edges.slice(0, -1).map(dayLabel), edges };
  }

  const edges = Array.from({ length: 31 }, (_, i) => new Date(today.getTime() + (i - 29) * DAY));
  return { labels: edges.slice(0, -1).map(dayLabel), edges };
}

/** Cộng dồn `value` của từng dòng vào khoảng thời gian chứa `date`. */
export function sumIntoBuckets(
  rows: { date: Date; value: number }[],
  { edges }: TimeBuckets,
): number[] {
  const totals = new Array<number>(edges.length - 1).fill(0);
  for (const row of rows) {
    const t = row.date.getTime();
    const index = edges.findIndex((edge, i) => i > 0 && t < edge.getTime()) - 1;
    if (index >= 0 && t >= edges[0].getTime()) totals[index] += row.value;
  }
  return totals;
}

export type Trend = { label: string; up: boolean | null };

/** So sánh tháng này với tháng trước dưới dạng phần trăm. */
export function percentTrend(current: number, previous: number): Trend {
  if (previous === 0) {
    return current > 0 ? { label: "Mới", up: true } : { label: "0%", up: null };
  }
  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent === 0) return { label: "0%", up: null };
  return { label: `${percent > 0 ? "+" : ""}${percent}%`, up: percent > 0 };
}

/** Rút gọn số cho trục biểu đồ: 1.500.000 → 1,5tr. */
export function formatCompact(value: number) {
  const fmt = (n: number) => n.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
  if (value >= 1_000_000_000) return `${fmt(value / 1_000_000_000)}tỷ`;
  if (value >= 1_000_000) return `${fmt(value / 1_000_000)}tr`;
  if (value >= 1_000) return `${fmt(value / 1_000)}k`;
  return fmt(value);
}
