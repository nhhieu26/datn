import type { hotelBookingRepo } from "@/entities/hotel-booking";
import type { restaurantBookingRepo } from "@/entities/restaurant-booking";
import type { tourBookingRepo } from "@/entities/tour-booking";
import type { BookingStatus } from "@/generated/prisma/enums";
import { reviewUrl } from "@/features/customer/reviews/paths";
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
  BookingKind,
  MyBookingItem,
  MyBookingsSummary,
  MyHotelBookingItem,
  MyRestaurantBookingItem,
  MyRestaurantBookingsSummary,
  ReviewState,
} from "./types";

type PageItem<T extends (...args: never[]) => Promise<{ items: unknown[] }>> =
  Awaited<ReturnType<T>>["items"][number];

const CANCELLABLE_STATUSES: BookingStatus[] = ["paid", "confirmed"];

function toReviewState(
  kind: BookingKind,
  booking: { status: BookingStatus; review: { id: string } | null },
  slug: string | undefined,
): ReviewState {
  if (booking.status !== "completed") return null;
  if (booking.review) return "reviewed";
  return slug ? reviewUrl(kind, slug) : null;
}

export function mapToMyHotelBookingItem(
  booking: PageItem<typeof hotelBookingRepo.findPageByCustomerId>,
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
    review: toReviewState("hotel", booking, booking.room?.hotel.slug),
    createdAt: booking.createdAt.toISOString(),
  };
}

const CANCELLABLE_RESTAURANT_STATUSES: BookingStatus[] = [
  "pending_confirmation",
  "confirmed",
];

export function mapToMyRestaurantBookingItem(
  booking: PageItem<typeof restaurantBookingRepo.findPageByCustomerId>,
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
    canCancel: CANCELLABLE_RESTAURANT_STATUSES.includes(booking.status),
    cancelDeadlinePassed: !canCustomerCancelBefore(
      reservationInstant(booking.reservationDate, booking.startTime),
      new Date(),
      RESTAURANT_CANCEL_CUTOFF_HOURS,
    ),
    review: toReviewState("restaurant", booking, booking.restaurant?.slug),
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

export function mapToMyBookingItem(
  booking: PageItem<typeof tourBookingRepo.findPageByCustomerId>,
): MyBookingItem {
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
    review: toReviewState("tour", booking, booking.tourDeparture?.tour.slug),
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
