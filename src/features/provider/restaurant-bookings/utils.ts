import type {
  RestaurantBookingListItem as RestaurantBookingRecord,
  RestaurantBookingProviderDetail,
} from "@/entities/restaurant-booking";
import type { ProviderBookingTransition } from "@/features/provider/tour-bookings/types";
import {
  BOOKING_STATUS_OPTIONS,
  extractTourImageUrl,
} from "@/features/provider/tour-bookings/utils";
import type { BookingStatus } from "@/generated/prisma/enums";
import type {
  RestaurantBookingDetailView,
  RestaurantBookingListItem,
  RestaurantBookingsSummary,
} from "./types";

/** Các trạng thái provider nhà hàng được chuyển tới, theo trạng thái hiện tại. */
export const RESTAURANT_PROVIDER_TRANSITIONS: Partial<
  Record<BookingStatus, ProviderBookingTransition[]>
> = {
  pending_confirmation: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
};

const RESTAURANT_STATUSES: BookingStatus[] = [
  "pending_confirmation",
  "confirmed",
  "completed",
  "cancelled",
];

export const RESTAURANT_STATUS_OPTIONS = BOOKING_STATUS_OPTIONS.filter((o) =>
  RESTAURANT_STATUSES.includes(o.value),
);

export function mapRestaurantBookingToListItem(
  booking: RestaurantBookingRecord,
): RestaurantBookingListItem {
  return {
    id: booking.id,
    code: booking.code,
    restaurantName: booking.restaurantName,
    imageUrl: extractTourImageUrl(booking.restaurant?.images),
    customerName: booking.contactName,
    customerPhone: booking.contactPhone,
    customerEmail: booking.contactEmail,
    reservationDate: booking.reservationDate.toISOString(),
    startTime: booking.startTime,
    endTime: booking.restaurantTimeSlot?.endTime ?? null,
    guests: booking.guests,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
  };
}

const iso = (d: Date | null) => (d ? d.toISOString() : null);

export function mapRestaurantBookingToDetail(
  booking: RestaurantBookingProviderDetail,
): RestaurantBookingDetailView {
  const restaurant = booking.restaurant;
  return {
    code: booking.code,
    status: booking.status,
    restaurantName: booking.restaurantName,
    imageUrl: extractTourImageUrl(restaurant?.images),
    provinceName: restaurant?.province.name ?? null,
    address: restaurant?.address ?? null,
    reservationDate: booking.reservationDate.toISOString(),
    startTime: booking.startTime,
    endTime: booking.restaurantTimeSlot?.endTime ?? null,
    guests: booking.guests,
    contactName: booking.contactName,
    contactEmail: booking.contactEmail,
    contactPhone: booking.contactPhone,
    accountName: booking.customer.fullname,
    note: booking.note,
    cancelReason: booking.cancelReason,
    createdAt: booking.createdAt.toISOString(),
    confirmedAt: iso(booking.confirmedAt),
    completedAt: iso(booking.completedAt),
    cancelledAt: iso(booking.cancelledAt),
  };
}

export function getRestaurantBookingsSummary({
  rows,
  upcoming,
}: {
  rows: { status: BookingStatus; _count: { _all: number } }[];
  upcoming: number;
}): RestaurantBookingsSummary {
  const countOf = (status: BookingStatus) =>
    rows.find((row) => row.status === status)?._count._all ?? 0;
  return {
    total: rows.reduce((sum, row) => sum + row._count._all, 0),
    pendingConfirmation: countOf("pending_confirmation"),
    confirmed: countOf("confirmed"),
    upcoming,
  };
}

export function formatTimeRange(startTime: string, endTime: string | null) {
  return endTime ? `${startTime} – ${endTime}` : startTime;
}
