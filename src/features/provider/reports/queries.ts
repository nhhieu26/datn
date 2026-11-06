import { hotelBookingRepo } from "@/entities/hotel-booking";
import { restaurantBookingRepo } from "@/entities/restaurant-booking";
import { tourBookingRepo } from "@/entities/tour-booking";
import type { BookingStatus, BusinessType } from "@/generated/prisma/client";
import { formatCurrency } from "@/lib/utils";
import { percentTrend, sumIntoBuckets } from "../dashboard/utils";
import type { ReportQuery } from "./search-params";
import type { ReportData } from "./types";
import { bucketRange, resolveReportPeriod } from "./utils";

type StatusCount = { status: BookingStatus; count: number };

type ReportSource = {
  countByStatus: (id: string, range: { from: Date; to: Date }) => Promise<StatusCount[]>;
  findPrimaryRows: (id: string, from: Date) => Promise<{ date: Date; value: number }[]>;
};

const SOURCES: Record<BusinessType, ReportSource> = {
  tour: {
    countByStatus: tourBookingRepo.countByStatus,
    findPrimaryRows: tourBookingRepo.findRevenueRows,
  },
  hotel: {
    countByStatus: hotelBookingRepo.countByStatus,
    findPrimaryRows: hotelBookingRepo.findRevenueRows,
  },
  restaurant: {
    countByStatus: restaurantBookingRepo.countByStatus,
    findPrimaryRows: restaurantBookingRepo.findGuestRows,
  },
};

// Cùng định nghĩa với bảng điều khiển để số liệu hai trang khớp nhau
const UNCOUNTED: Record<BusinessType, BookingStatus[]> = {
  tour: ["pending_payment", "expired"],
  hotel: ["pending_payment", "expired"],
  restaurant: ["expired"],
};
const SECURED: Record<BusinessType, BookingStatus[]> = {
  tour: ["paid", "confirmed", "completed"],
  hotel: ["paid", "confirmed", "completed"],
  restaurant: ["confirmed", "completed"],
};

const ratio = (part: number, whole: number) => (whole ? part / whole : 0);
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const round1 = (value: number) => Math.round(value * 10) / 10;
const formatNumber = (value: number) =>
  value.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
const formatPercent = (value: number) => `${formatNumber(value)}%`;

function summarize(kind: BusinessType, rows: StatusCount[]) {
  const countIn = (statuses: BookingStatus[]) =>
    rows.reduce((sum, r) => (statuses.includes(r.status) ? sum + r.count : sum), 0);
  const total = rows.reduce(
    (sum, r) => (UNCOUNTED[kind].includes(r.status) ? sum : sum + r.count),
    0,
  );
  const completed = countIn(["completed"]);
  const cancelled = countIn(["cancelled"]);
  return {
    total,
    secured: countIn(SECURED[kind]),
    completed,
    completionRate: ratio(completed, total) * 100,
    cancellationRate: ratio(cancelled, total) * 100,
  };
}

function buildInsight(currentTotal: number, previousTotal: number, current: number, previous: number) {
  if (!currentTotal) return "Chưa có đơn đặt nào trong kỳ này.";
  const rate = `Tỷ lệ hoàn thành kỳ này là ${formatPercent(current)}`;
  if (!previousTotal) return `${rate}. Kỳ trước chưa có đơn đặt để so sánh.`;
  const diff = round1(current - previous);
  if (diff === 0) return `${rate}, không đổi so với kỳ trước.`;
  return `${rate}, ${diff > 0 ? "cao hơn" : "thấp hơn"} ${formatNumber(Math.abs(diff))} điểm phần trăm so với kỳ trước.`;
}

export async function getReportData(
  kind: BusinessType,
  providerProfileId: string,
  query: ReportQuery,
  now = new Date(),
): Promise<ReportData> {
  const source = SOURCES[kind];
  const period = resolveReportPeriod(query, now);

  const [currentRows, previousRows, primaryRows] = await Promise.all([
    source.countByStatus(providerProfileId, bucketRange(period.current)),
    source.countByStatus(providerProfileId, bucketRange(period.previous)),
    source.findPrimaryRows(providerProfileId, period.previous.edges[0]),
  ]);

  const current = summarize(kind, currentRows);
  const previous = summarize(kind, previousRows);
  const values = sumIntoBuckets(primaryRows, period.current);
  const previousValues = sumIntoBuckets(primaryRows, period.previous);
  const primary = sum(values);
  const previousPrimary = sum(previousValues);
  const average = ratio(primary, current.secured);
  const previousAverage = ratio(previousPrimary, previous.secured);

  const isRestaurant = kind === "restaurant";
  const cancelTrend = percentTrend(current.cancellationRate, previous.cancellationRate);

  return {
    kind,
    periodLabel: period.label,
    updatedAt: now,
    chart: {
      title: isRestaurant ? "Lượt khách" : "Doanh thu ròng",
      labels: period.current.labels,
      values,
      unit: isRestaurant ? "guests" : "currency",
    },
    previousValues,
    stats: [
      {
        key: "average",
        label: isRestaurant ? "Số khách TB mỗi đơn" : "Giá trị đơn TB",
        value: isRestaurant ? formatNumber(average) : formatCurrency(average),
        trend: percentTrend(average, previousAverage),
      },
      {
        key: "completion",
        label: "Tỷ lệ hoàn thành",
        value: formatPercent(current.completionRate),
        trend: percentTrend(current.completionRate, previous.completionRate),
      },
      {
        key: "cancellation",
        label: "Tỷ lệ hủy",
        value: formatPercent(current.cancellationRate),
        // Tỷ lệ hủy tăng là tín hiệu xấu nên đảo màu
        trend: { ...cancelTrend, up: cancelTrend.up === null ? null : !cancelTrend.up },
      },
      {
        key: "primary",
        label: isRestaurant ? "Tổng lượt khách" : "Doanh thu ròng",
        value: isRestaurant ? primary.toLocaleString("vi-VN") : formatCurrency(primary),
        trend: percentTrend(primary, previousPrimary),
      },
    ],
    funnel: [
      { label: "Tổng đơn đặt", count: current.total },
      { label: isRestaurant ? "Đã xác nhận" : "Đã thanh toán", count: current.secured },
      { label: "Hoàn thành", count: current.completed },
    ].map((stage) => ({ ...stage, percent: round1(ratio(stage.count, current.total) * 100) })),
    insight: buildInsight(
      current.total,
      previous.total,
      current.completionRate,
      previous.completionRate,
    ),
  };
}
