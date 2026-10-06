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

export type TourBookingDetailView = {
  code: string;
  status: BookingStatus;
  paymentState: PaymentState;
  tourTitle: string;
  tourImageUrl: string;
  provinceName: string | null;
  duration: { days: number; nights: number } | null;
  departureDate: string;
  guests: number;
  unitPrice: number;
  totalAmount: number;
  commissionRate: number;
  platformFee: number;
  providerAmount: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  accountName: string;
  note: string | null;
  cancelReason: string | null;
  expiresAt: string | null;
  createdAt: string;
  paidAt: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  payment: {
    gateway: string;
    status: string;
    chargedAmount: string;
    chargedCurrency: string;
    gatewayOrderId: string;
  } | null;
  refundedAmount: number;
  payout: { status: string; paidAt: string | null } | null;
};
