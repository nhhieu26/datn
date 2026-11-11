import type { RecentBookingType } from "@/entities/recent-bookings";
import type { RecentTransactionKind } from "@/entities/recent-transactions";
import type { BookingStatus, TransactionStatus } from "@/generated/prisma/client";
import type {
  MyBookingsSummary,
  MyRestaurantBookingsSummary,
} from "@/features/customer/my-bookings/types";

export type CustomerDashboardStats = {
  total: number;
  tour: MyBookingsSummary;
  hotel: MyBookingsSummary;
  restaurant: MyRestaurantBookingsSummary;
};

export type CustomerDashboardTransaction = {
  id: string;
  kind: RecentTransactionKind;
  reference: string;
  bookingCode: string;
  amount: number;
  chargedAmount: number;
  chargedCurrency: string;
  status: TransactionStatus;
  date: string;
};

export type CustomerDashboardBooking = {
  id: string;
  type: RecentBookingType;
  code: string;
  title: string;
  providerName: string;
  serviceDate: string;
  guests: number;
  status: BookingStatus;
  totalAmount: number | null;
};

export type CustomerDashboardData = {
  stats: CustomerDashboardStats;
  transactions: CustomerDashboardTransaction[];
  recentBookings: CustomerDashboardBooking[];
};
