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
  cancelReason: string | null;
  /** Đơn paid/confirmed — customer được hủy (nếu còn trong hạn). */
  canCancel: boolean;
  cancelDeadlinePassed: boolean;
  createdAt: string;
};

export type MyBookingsSummary = {
  total: number;
  awaitingPayment: number;
  totalPaid: number;
};
