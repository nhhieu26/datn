import type { BookingStatus } from "@/generated/prisma/enums";
import type { PaymentState } from "@/features/provider/tour-bookings";

export type MyBookingItem = {
  code: string;
  tourTitle: string;
  tourImageUrl: string;
  departureDate: string;
  guests: number;
  totalAmount: number;
  status: BookingStatus;
  paymentState: PaymentState;
  expiresAt: string | null;
  createdAt: string;
};

export type MyBookingsSummary = {
  total: number;
  awaitingPayment: number;
  totalPaid: number;
};
