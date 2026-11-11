import { hotelBookingRepo } from "@/entities/hotel-booking";
import { providerProfileRepo } from "@/entities/provider-profile";
import { provinceRepo } from "@/entities/province";
import { restaurantBookingRepo } from "@/entities/restaurant-booking";
import { tourBookingRepo } from "@/entities/tour-booking";
import { userRepo } from "@/entities/user";
import type { BookingStatus, BusinessType } from "@/generated/prisma/client";
import { percentTrend, sumIntoBuckets } from "@/features/provider/dashboard/utils";
import { SECURED, UNCOUNTED } from "@/features/provider/reports/queries";
import { bucketRange, resolveReportPeriod } from "@/features/provider/reports/utils";
import { formatCurrency } from "@/lib/utils";
import type { AdminReportQuery } from "./search-params";
import type {
  AdminKindSummary,
  AdminReportData,
  AdminTopProvider,
  AdminTopProvince,
} from "./types";

const TOP_LIMIT = 5;

export const KIND_LABELS: Record<BusinessType, string> = {
  tour: "Tour",
  hotel: "Khách sạn",
  restaurant: "Nhà hàng",
};

type BookingRow = {
  kind: BusinessType;
  createdAt: Date;
  status: BookingStatus;
  guests: number;
  totalAmount: number;
  platformFee: number;
  providerProfileId: string;
  provinceId: string | null;
};

const ratio = (part: number, whole: number) => (whole ? part / whole : 0);
const round1 = (value: number) => Math.round(value * 10) / 10;
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const formatNumber = (value: number) =>
  value.toLocaleString("vi-VN", { maximumFractionDigits: 1 });

/** Đơn được tính (bỏ đơn giữ chỗ chưa thanh toán / hết hạn). */
const isCounted = (row: BookingRow) => !UNCOUNTED[row.kind].includes(row.status);
/** Đơn đã chắc chắn (đã thanh toán hoặc nhà hàng đã xác nhận); chỉ đơn này tính GMV. */
const isSecured = (row: BookingRow) => SECURED[row.kind].includes(row.status);

function summarizeKind(kind: BusinessType, rows: BookingRow[]): AdminKindSummary {
  const counted = rows.filter((r) => r.kind === kind && isCounted(r));
  const secured = counted.filter(isSecured);
  const completed = counted.filter((r) => r.status === "completed").length;
  const cancelled = counted.filter((r) => r.status === "cancelled").length;
  return {
    kind,
    label: KIND_LABELS[kind],
    bookings: counted.length,
    completed,
    cancelled,
    completionRate: round1(ratio(completed, counted.length) * 100),
    cancellationRate: round1(ratio(cancelled, counted.length) * 100),
    guests: sum(secured.map((r) => r.guests)),
    gmv: sum(secured.map((r) => r.totalAmount)),
    fee: sum(secured.map((r) => r.platformFee)),
  };
}

function buildInsight(gmv: number, previousGmv: number, fee: number, bookings: number) {
  if (!bookings) return "Chưa có đơn đặt nào trên hệ thống trong kỳ này.";
  const feeRate = `hoa hồng chiếm ${formatNumber(ratio(fee, gmv) * 100)}% GMV`;
  if (!previousGmv) return `GMV kỳ này đạt ${formatCurrency(gmv)}, ${feeRate}. Kỳ trước chưa có doanh thu để so sánh.`;
  const diff = round1(ratio(gmv - previousGmv, previousGmv) * 100);
  const change =
    diff === 0
      ? "không đổi so với kỳ trước"
      : `${diff > 0 ? "tăng" : "giảm"} ${formatNumber(Math.abs(diff))}% so với kỳ trước`;
  return `GMV kỳ này đạt ${formatCurrency(gmv)}, ${change}; ${feeRate}.`;
}

export async function getAdminReportData(
  query: AdminReportQuery,
  now = new Date(),
): Promise<AdminReportData> {
  const period = resolveReportPeriod(query, now);
  const current = bucketRange(period.current);
  const previous = bucketRange(period.previous);
  // Một lần truy vấn phủ cả kỳ trước lẫn kỳ này
  const whole = { from: previous.from, to: current.to };

  const [tourRows, hotelRows, restaurantRows, signups, approvals, provinces] =
    await Promise.all([
      tourBookingRepo.findAdminReportRows(whole),
      hotelBookingRepo.findAdminReportRows(whole),
      restaurantBookingRepo.findAdminReportRows(whole),
      userRepo.findSignupRows(whole),
      providerProfileRepo.countByApprovalStatus(),
      provinceRepo.findAll(),
    ]);

  const all: BookingRow[] = [
    ...tourRows.map((r) => ({ ...r, kind: "tour" as const })),
    ...hotelRows.map((r) => ({ ...r, kind: "hotel" as const })),
    ...restaurantRows.map((r) => ({ ...r, kind: "restaurant" as const })),
  ];
  const inCurrent = (date: Date) => date >= current.from && date < current.to;
  const rows = all.filter((r) => inCurrent(r.createdAt));
  const previousRows = all.filter((r) => !inCurrent(r.createdAt));

  // Doanh thu theo kỳ
  const securedAll = all.filter(isSecured);
  const gmvRows = securedAll.map((r) => ({ date: r.createdAt, value: r.totalAmount }));
  const feeRows = securedAll.map((r) => ({ date: r.createdAt, value: r.platformFee }));
  const revenueValues = sumIntoBuckets(gmvRows, period.current);
  const previousRevenue = sumIntoBuckets(gmvRows, period.previous);
  const feeValues = sumIntoBuckets(feeRows, period.current);
  const previousFee = sumIntoBuckets(feeRows, period.previous);

  const gmv = sum(revenueValues);
  const previousGmv = sum(previousRevenue);
  const fee = sum(feeValues);

  // Đơn đặt theo loại dịch vụ
  const kindOrder: BusinessType[] = ["tour", "hotel", "restaurant"];
  const kinds = kindOrder.map((kind) => summarizeKind(kind, rows));
  const bookings = rows.filter(isCounted);
  const previousBookings = previousRows.filter(isCounted).length;
  const securedCount = bookings.filter(isSecured).length;
  const completedCount = bookings.filter((r) => r.status === "completed").length;

  // Người dùng mới
  const signupRows = (role: "customer" | "provider") =>
    signups.filter((u) => u.role === role).map((u) => ({ date: u.createdAt, value: 1 }));
  const customers = sumIntoBuckets(signupRows("customer"), period.current);
  const providers = sumIntoBuckets(signupRows("provider"), period.current);
  const newUsers = sum(customers) + sum(providers);
  const previousNewUsers = signups.filter((u) => !inCurrent(u.createdAt)).length;

  // Top đối tác theo GMV (cùng GMV thì xếp theo số đơn)
  const byProvider = new Map<string, { kind: BusinessType; bookings: number; gmv: number; fee: number }>();
  for (const row of bookings) {
    const entry = byProvider.get(row.providerProfileId) ?? { kind: row.kind, bookings: 0, gmv: 0, fee: 0 };
    entry.bookings += 1;
    if (isSecured(row)) {
      entry.gmv += row.totalAmount;
      entry.fee += row.platformFee;
    }
    byProvider.set(row.providerProfileId, entry);
  }
  const topEntries = [...byProvider.entries()]
    .sort(([, a], [, b]) => b.gmv - a.gmv || b.bookings - a.bookings)
    .slice(0, TOP_LIMIT);
  const names = new Map(
    (await providerProfileRepo.findNamesByIds(topEntries.map(([id]) => id))).map((p) => [
      p.id,
      p.businessName,
    ]),
  );
  const topProviders: AdminTopProvider[] = topEntries.map(([id, e]) => ({
    id,
    name: names.get(id) ?? "Đối tác đã xóa",
    kind: e.kind,
    bookings: e.bookings,
    gmv: e.gmv,
    fee: e.fee,
    share: round1(ratio(e.gmv, gmv) * 100),
  }));

  // Top tỉnh/thành theo số đơn
  const provinceNames = new Map(provinces.map((p) => [p.id, p.name]));
  const byProvince = new Map<string, number>();
  for (const row of bookings) {
    if (row.provinceId) byProvince.set(row.provinceId, (byProvince.get(row.provinceId) ?? 0) + 1);
  }
  const topProvinces: AdminTopProvince[] = [...byProvince.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, TOP_LIMIT)
    .map(([id, count]) => ({
      id,
      name: provinceNames.get(id) ?? "Không rõ",
      bookings: count,
      share: round1(ratio(count, bookings.length) * 100),
    }));

  return {
    periodLabel: period.label,
    updatedAt: now,
    revenue: {
      title: "GMV",
      labels: period.current.labels,
      values: revenueValues,
      unit: "currency",
    },
    previousRevenue,
    feeValues,
    stats: [
      {
        key: "gmv",
        label: "Tổng giá trị giao dịch (GMV)",
        value: formatCurrency(gmv),
        raw: gmv,
        trend: percentTrend(gmv, previousGmv),
      },
      {
        key: "fee",
        label: "Hoa hồng nền tảng",
        value: formatCurrency(fee),
        raw: fee,
        trend: percentTrend(fee, sum(previousFee)),
      },
      {
        key: "bookings",
        label: "Tổng đơn đặt",
        value: bookings.length.toLocaleString("vi-VN"),
        raw: bookings.length,
        trend: percentTrend(bookings.length, previousBookings),
      },
      {
        key: "users",
        label: "Tài khoản mới",
        value: newUsers.toLocaleString("vi-VN"),
        raw: newUsers,
        trend: percentTrend(newUsers, previousNewUsers),
      },
    ],
    kinds,
    funnel: [
      { label: "Tổng đơn đặt", count: bookings.length },
      { label: "Đã thanh toán / xác nhận", count: securedCount },
      { label: "Hoàn thành", count: completedCount },
    ].map((stage) => ({
      ...stage,
      percent: round1(ratio(stage.count, bookings.length) * 100),
    })),
    userGrowth: {
      labels: period.current.labels,
      customers,
      providers,
      totalCustomers: sum(customers),
      totalProviders: sum(providers),
    },
    approvals,
    topProviders,
    topProvinces,
    insight: buildInsight(gmv, previousGmv, fee, bookings.length),
  };
}
