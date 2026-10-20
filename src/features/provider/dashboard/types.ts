import type { BookingStatus, BusinessType } from "@/generated/prisma/client";
import type { Trend } from "./utils";

export type DashboardStat = {
  key: "bookings" | "primary" | "services" | "rating";
  label: string;
  value: string;
  trend: Trend;
};

export type ActivityType = "booking" | "cancel" | "review" | "payment" | "refund";

export type DashboardActivity = {
  type: ActivityType;
  title: string;
  desc: string;
  at: Date;
};

export type UpcomingBooking = {
  code: string;
  customer: string;
  service: string;
  date: Date;
  status: BookingStatus;
  /** Số tiền (tour/khách sạn) hoặc số khách (nhà hàng), đã định dạng. */
  amount: string;
};

export type DashboardChart = {
  title: string;
  labels: string[];
  values: number[];
  unit: "currency" | "guests";
};

export type DashboardData = {
  kind: BusinessType;
  stats: DashboardStat[];
  chart: DashboardChart;
  activities: DashboardActivity[];
  upcoming: UpcomingBooking[];
};
