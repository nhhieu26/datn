import type { BookingStatus } from "@/generated/prisma/enums";

export type PaymentState =
  | "unpaid"
  | "processing"
  | "paid"
  | "failed"
  | "refunded";

export type TourBookingListItem = {
  id: string;
  code: string;
  tourTitle: string;
  tourImageUrl: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  guests: number;
  totalAmount: number;
  providerAmount: number;
  paymentState: PaymentState;
  status: BookingStatus;
  createdAt: string;
};

export type TourBookingsSummary = {
  total: number;
  awaitingPayment: number;
  confirmed: number;
  revenue: number;
};
