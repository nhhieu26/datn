import type { TourBookingWithPayment } from "@/entities/tour-booking";
import type { BookingStatus } from "@/generated/prisma/enums";
import {
  extractTourImageUrl,
  getPaymentState,
} from "@/features/provider/tour-bookings";
import { canCustomerCancelBefore } from "@/lib/utils";
import type { MyBookingItem, MyBookingsSummary } from "./types";

const CANCELLABLE_STATUSES: BookingStatus[] = ["paid", "confirmed"];

export function mapToMyBookingItem(booking: TourBookingWithPayment): MyBookingItem {
  return {
    code: booking.code,
    tourTitle: booking.tourTitle,
    tourImageUrl: extractTourImageUrl(booking.tourDeparture?.tour.images),
    departureDate: booking.departureDate.toISOString(),
    guests: booking.guests,
    totalAmount: Number(booking.totalAmount),
    status: booking.status,
    paymentState: getPaymentState(booking),
    expiresAt: booking.expiresAt?.toISOString() ?? null,
    cancelReason: booking.cancelReason,
    canCancel: CANCELLABLE_STATUSES.includes(booking.status),
    cancelDeadlinePassed: !canCustomerCancelBefore(booking.departureDate),
    createdAt: booking.createdAt.toISOString(),
  };
}

const PAID_STATUSES: BookingStatus[] = ["paid", "confirmed", "completed"];

export function getMyBookingsSummary(
  rows: {
    status: BookingStatus;
    _count: { _all: number };
    _sum: { totalAmount: { toNumber(): number } | null };
  }[],
): MyBookingsSummary {
  return {
    total: rows.reduce((sum, r) => sum + r._count._all, 0),
    awaitingPayment: rows
      .filter((r) => r.status === "pending_payment")
      .reduce((sum, r) => sum + r._count._all, 0),
    totalPaid: rows
      .filter((r) => PAID_STATUSES.includes(r.status))
      .reduce((sum, r) => sum + (r._sum.totalAmount?.toNumber() ?? 0), 0),
  };
}
