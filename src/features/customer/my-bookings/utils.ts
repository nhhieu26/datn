import type { HotelBookingWithPayment } from "@/entities/hotel-booking";
import type { RestaurantBookingListItem } from "@/entities/restaurant-booking";
import type { TourBookingWithPayment } from "@/entities/tour-booking";
import type { BookingStatus } from "@/generated/prisma/enums";
import { extractRoomImageUrl } from "@/features/provider/hotel-bookings/utils";
import {
  extractTourImageUrl,
  getPaymentState,
} from "@/features/provider/tour-bookings";
import {
  canCustomerCancelBefore,
  reservationInstant,
  RESTAURANT_CANCEL_CUTOFF_HOURS,
} from "@/lib/utils";
import type {
  MyBookingItem,
  MyBookingsSummary,
  MyHotelBookingItem,
  MyRestaurantBookingItem,
  MyRestaurantBookingsSummary,
} from "./types";

const CANCELLABLE_STATUSES: BookingStatus[] = ["paid", "confirmed"];

export function mapToMyHotelBookingItem(
  booking: HotelBookingWithPayment,
): MyHotelBookingItem {
  return {
    code: booking.code,
    hotelName: booking.hotelName,
    roomName: booking.roomName,
    imageUrl: extractRoomImageUrl(booking.room),
    checkInDate: booking.checkInDate.toISOString(),
    checkOutDate: booking.checkOutDate.toISOString(),
    nights: booking.nights,
    roomQuantity: booking.roomQuantity,
    guests: booking.guests,
    totalAmount: Number(booking.totalAmount),
    status: booking.status,
    paymentState: getPaymentState(booking),
    expiresAt: booking.expiresAt?.toISOString() ?? null,
    cancelReason: booking.cancelReason,
    canCancel: CANCELLABLE_STATUSES.includes(booking.status),
    cancelDeadlinePassed: !canCustomerCancelBefore(booking.checkInDate),
    createdAt: booking.createdAt.toISOString(),
  };
}

export function mapToMyRestaurantBookingItem(
  booking: RestaurantBookingListItem,
): MyRestaurantBookingItem {
  return {
    code: booking.code,
    restaurantName: booking.restaurantName,
    imageUrl: extractTourImageUrl(booking.restaurant?.images),
    reservationDate: booking.reservationDate.toISOString(),
    startTime: booking.startTime,
    endTime: booking.restaurantTimeSlot?.endTime ?? null,
    guests: booking.guests,
    status: booking.status,
    cancelReason: booking.cancelReason,
    canCancel: booking.status === "confirmed",
    cancelDeadlinePassed: !canCustomerCancelBefore(
      reservationInstant(booking.reservationDate, booking.startTime),
      new Date(),
      RESTAURANT_CANCEL_CUTOFF_HOURS,
    ),
    createdAt: booking.createdAt.toISOString(),
  };
}

const CANCELLED_STATUSES: BookingStatus[] = ["cancelled", "expired", "no_show"];

export function getMyRestaurantBookingsSummary({
  rows,
  upcoming,
}: {
  rows: { status: BookingStatus; _count: { _all: number } }[];
  upcoming: number;
}): MyRestaurantBookingsSummary {
  return {
    total: rows.reduce((sum, r) => sum + r._count._all, 0),
    upcoming,
    cancelled: rows
      .filter((r) => CANCELLED_STATUSES.includes(r.status))
      .reduce((sum, r) => sum + r._count._all, 0),
  };
}

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
