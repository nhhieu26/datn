import { hotelRepo } from "@/entities/hotel";
import { hotelBookingRepo } from "@/entities/hotel-booking";
import { restaurantRepo } from "@/entities/restaurant";
import { restaurantBookingRepo } from "@/entities/restaurant-booking";
import { reviewRepo } from "@/entities/review";
import { tourRepo } from "@/entities/tour";
import { tourBookingRepo } from "@/entities/tour-booking";
import type { BusinessType } from "@/generated/prisma/client";
import { formatCurrency, todayIsoDate } from "@/lib/utils";
import type { DashboardRange } from "./search-params";
import type {
  DashboardActivity,
  DashboardData,
  UpcomingBooking,
} from "./types";
import {
  buildTimeBuckets,
  percentTrend,
  startOfMonthVn,
  sumIntoBuckets,
  type Trend,
} from "./utils";

const ACTIVITY_LIMIT = 6;
const UPCOMING_LIMIT = 5;

type Range = { from?: Date; to?: Date };

/** Nguồn dữ liệu theo loại dịch vụ; nhà hàng dùng lượt khách thay cho doanh thu. */
type KindSource = {
  countBookings: (id: string, range?: Range) => Promise<number>;
  sumPrimary: (id: string, range?: Range) => Promise<number>;
  findPrimaryRows: (id: string, from: Date) => Promise<{ date: Date; value: number }[]>;
  countServices: (id: string, createdFrom?: Date) => Promise<number>;
  findUpcoming: (id: string, from: Date) => Promise<UpcomingBooking[]>;
  findActivities: (id: string) => Promise<DashboardActivity[]>;
};

const guestsLabel = (guests: number) => `${guests} khách`;

type BookingRef = { code: string; contactName: string };

function bookingActivities<
  C extends BookingRef & { createdAt: Date },
  X extends BookingRef & { cancelledAt: Date | null },
>(
  rows: { created: C[]; cancelled: X[] },
  serviceOf: (row: C | X) => string,
): DashboardActivity[] {
  return [
    ...rows.created.map((b) => ({
      type: "booking" as const,
      title: `Đơn đặt mới ${b.code}`,
      desc: `${b.contactName} · ${serviceOf(b)}`,
      at: b.createdAt,
    })),
    ...rows.cancelled.map((b) => ({
      type: "cancel" as const,
      title: `Đơn ${b.code} đã bị hủy`,
      desc: `${b.contactName} · ${serviceOf(b)}`,
      at: b.cancelledAt ?? new Date(0),
    })),
  ];
}

function moneyActivities<T extends BookingRef>(
  payments: { amount: unknown; paidAt: Date | null; booking: T | null }[],
  refunds: { amount: unknown; processedAt: Date | null; booking: T | null }[],
): DashboardActivity[] {
  const desc = (b: T | null) => (b ? `Đơn ${b.code} · ${b.contactName}` : "");
  return [
    ...payments.map((p) => ({
      type: "payment" as const,
      title: `Nhận thanh toán +${formatCurrency(Number(p.amount))}`,
      desc: desc(p.booking),
      at: p.paidAt ?? new Date(0),
    })),
    ...refunds.map((r) => ({
      type: "refund" as const,
      title: `Hoàn tiền -${formatCurrency(Number(r.amount))}`,
      desc: desc(r.booking),
      at: r.processedAt ?? new Date(0),
    })),
  ];
}

const SOURCES: Record<BusinessType, KindSource> = {
  tour: {
    countBookings: tourBookingRepo.countForDashboard,
    sumPrimary: tourBookingRepo.sumRevenue,
    findPrimaryRows: tourBookingRepo.findRevenueRows,
    countServices: tourRepo.countActiveByProviderProfileId,
    findUpcoming: async (id, from) =>
      (await tourBookingRepo.findUpcomingForProvider(id, from, UPCOMING_LIMIT)).map((b) => ({
        code: b.code,
        customer: b.contactName,
        service: b.tourTitle,
        date: b.departureDate,
        status: b.status,
        amount: formatCurrency(Number(b.totalAmount)),
      })),
    findActivities: async (id) => {
      const rows = await tourBookingRepo.findRecentActivityForProvider(id, ACTIVITY_LIMIT);
      return [
        ...bookingActivities(rows, (b) => b.tourTitle),
        ...moneyActivities(
          rows.payments.map((p) => ({ ...p, booking: p.tourBooking })),
          rows.refunds.map((r) => ({ ...r, booking: r.tourBooking })),
        ),
      ];
    },
  },
  hotel: {
    countBookings: hotelBookingRepo.countForDashboard,
    sumPrimary: hotelBookingRepo.sumRevenue,
    findPrimaryRows: hotelBookingRepo.findRevenueRows,
    countServices: hotelRepo.countActiveByProviderProfileId,
    findUpcoming: async (id, from) =>
      (await hotelBookingRepo.findUpcomingForProvider(id, from, UPCOMING_LIMIT)).map((b) => ({
        code: b.code,
        customer: b.contactName,
        service: `${b.hotelName} · ${b.roomName}`,
        date: b.checkInDate,
        status: b.status,
        amount: formatCurrency(Number(b.totalAmount)),
      })),
    findActivities: async (id) => {
      const rows = await hotelBookingRepo.findRecentActivityForProvider(id, ACTIVITY_LIMIT);
      return [
        ...bookingActivities(rows, (b) => `${b.hotelName} · ${b.roomName}`),
        ...moneyActivities(
          rows.payments.map((p) => ({ ...p, booking: p.hotelBooking })),
          rows.refunds.map((r) => ({ ...r, booking: r.hotelBooking })),
        ),
      ];
    },
  },
  restaurant: {
    countBookings: restaurantBookingRepo.countForDashboard,
    sumPrimary: restaurantBookingRepo.sumGuests,
    findPrimaryRows: restaurantBookingRepo.findGuestRows,
    countServices: restaurantRepo.countActiveByProviderProfileId,
    findUpcoming: async (id, from) =>
      (await restaurantBookingRepo.findUpcomingForProvider(id, from, UPCOMING_LIMIT)).map((b) => ({
        code: b.code,
        customer: b.contactName,
        service: `${b.restaurantName} · ${b.startTime}`,
        date: b.reservationDate,
        status: b.status,
        amount: guestsLabel(b.guests),
      })),
    findActivities: async (id) => {
      const rows = await restaurantBookingRepo.findRecentActivityForProvider(id, ACTIVITY_LIMIT);
      return bookingActivities(rows, (b) => `${b.restaurantName} · ${guestsLabel(b.guests)}`);
    },
  },
};

async function findReviewActivities(kind: BusinessType, id: string): Promise<DashboardActivity[]> {
  const { items } = await reviewRepo.findPageByProviderProfileId(kind, id, {}, {
    skip: 0,
    take: ACTIVITY_LIMIT,
  });
  return items.map((r) => ({
    type: "review",
    title: `Đánh giá mới ${r.rating}★`,
    desc: `${r.customerName}: “${r.content}”`,
    at: r.createdAt,
  }));
}

export async function getDashboardData(
  kind: BusinessType,
  providerProfileId: string,
  range: DashboardRange,
  now = new Date(),
): Promise<DashboardData> {
  const source = SOURCES[kind];
  const thisMonth = { from: startOfMonthVn(now) };
  const lastMonth = { from: startOfMonthVn(now, -1), to: thisMonth.from };
  const buckets = buildTimeBuckets(range, now);

  const [
    totalBookings,
    bookingsThisMonth,
    bookingsLastMonth,
    totalPrimary,
    primaryThisMonth,
    primaryLastMonth,
    primaryRows,
    activeServices,
    newServices,
    reviewSummary,
    upcoming,
    bookingActivityRows,
    reviewActivities,
  ] = await Promise.all([
    source.countBookings(providerProfileId),
    source.countBookings(providerProfileId, thisMonth),
    source.countBookings(providerProfileId, lastMonth),
    source.sumPrimary(providerProfileId),
    source.sumPrimary(providerProfileId, thisMonth),
    source.sumPrimary(providerProfileId, lastMonth),
    source.findPrimaryRows(providerProfileId, buckets.edges[0]),
    source.countServices(providerProfileId),
    source.countServices(providerProfileId, thisMonth.from),
    reviewRepo.summarizeByProviderProfileId(kind, providerProfileId),
    // Ngày sử dụng lưu dạng 0h UTC của ngày theo lịch VN
    source.findUpcoming(providerProfileId, new Date(`${todayIsoDate(now)}T00:00:00Z`)),
    source.findActivities(providerProfileId),
    findReviewActivities(kind, providerProfileId),
  ]);

  const isRestaurant = kind === "restaurant";
  const servicesTrend: Trend = {
    label: `+${newServices}`,
    up: newServices > 0 ? true : null,
  };

  return {
    kind,
    stats: [
      {
        key: "bookings",
        label: "Tổng đơn đặt",
        value: totalBookings.toLocaleString("vi-VN"),
        trend: percentTrend(bookingsThisMonth, bookingsLastMonth),
      },
      {
        key: "primary",
        label: isRestaurant ? "Tổng lượt khách" : "Doanh thu ròng",
        value: isRestaurant
          ? totalPrimary.toLocaleString("vi-VN")
          : formatCurrency(totalPrimary),
        trend: percentTrend(primaryThisMonth, primaryLastMonth),
      },
      {
        key: "services",
        label: "Dịch vụ đang hoạt động",
        value: activeServices.toLocaleString("vi-VN"),
        trend: servicesTrend,
      },
      {
        key: "rating",
        label: "Điểm đánh giá TB",
        value: reviewSummary.total
          ? `${reviewSummary.average.toLocaleString("vi-VN")}/5`
          : "Chưa có",
        trend: { label: `${reviewSummary.total} đánh giá`, up: null },
      },
    ],
    chart: {
      title: isRestaurant ? "Lượt khách" : "Doanh thu",
      labels: buckets.labels,
      values: sumIntoBuckets(primaryRows, buckets),
      unit: isRestaurant ? "guests" : "currency",
    },
    activities: [...bookingActivityRows, ...reviewActivities]
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, ACTIVITY_LIMIT),
    upcoming,
  };
}
