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

export type MyHotelBookingItem = {
  code: string;
  hotelName: string;
  roomName: string;
  imageUrl: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomQuantity: number;
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

export type MyRestaurantBookingItem = {
  code: string;
  restaurantName: string;
  imageUrl: string;
  reservationDate: string;
  startTime: string;
  endTime: string | null;
  guests: number;
  status: BookingStatus;
  cancelReason: string | null;
  /** Đơn confirmed — customer được hủy (nếu còn trong hạn). */
  canCancel: boolean;
  cancelDeadlinePassed: boolean;
  createdAt: string;
};

export type BookingKind = "tour" | "hotel" | "restaurant";

/** Dữ liệu tối thiểu để menu/dialog hủy dùng chung cho đơn tour và khách sạn. */
export type CancellableBooking = {
  kind: BookingKind;
  code: string;
  title: string;
  totalAmount: number;
  status: BookingStatus;
  canCancel: boolean;
  cancelDeadlinePassed: boolean;
};

export type MyBookingsSummary = {
  total: number;
  awaitingPayment: number;
  totalPaid: number;
};

export type MyRestaurantBookingsSummary = {
  total: number;
  upcoming: number;
  cancelled: number;
};
