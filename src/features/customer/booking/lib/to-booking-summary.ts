import type { HotelDetail } from "@/features/customer/hotel-detail/lib/to-hotel-detail";
import type { RestaurantDetail } from "@/features/customer/restaurant-detail/lib/restaurant-detail";
import type { TourDetail } from "@/features/customer/tour-detail/lib/to-tour-detail";
import type { HotelBookingDetail } from "@/entities/hotel-booking";
import type { RestaurantBookingDetail } from "@/entities/restaurant-booking";
import type { TourBookingDetail } from "@/entities/tour-booking";
import {
  formatDate,
  RESTAURANT_CANCEL_CUTOFF_HOURS,
  todayIsoDate,
} from "@/lib/utils";
import { formatVnd } from "@/features/customer/components/cards/card-parts";
import type { BookingSummary } from "../types";

export type BookingQuery = Record<string, string | string[] | undefined>;

const DAY = 86_400_000;

function str(q: BookingQuery, key: string) {
  const v = q[key];
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

function int(q: BookingQuery, key: string, min: number, fallback: number) {
  const n = Number.parseInt(str(q, key), 10);
  return Number.isFinite(n) ? Math.max(min, n) : fallback;
}

// Các hàm trả null khi lựa chọn trên query không hợp lệ → page redirect về trang chi tiết

export function tourSummary(
  tour: TourDetail,
  q: BookingQuery,
): BookingSummary | null {
  const departure = tour.departures.find((d) => d.id === str(q, "departureId"));
  if (!departure) return null;
  const guests = int(q, "guests", 1, 1);
  if (guests > departure.slotsLeft) return null;
  return {
    kind: "tour",
    backHref: `/tours/${tour.slug}`,
    name: tour.title,
    location: tour.location,
    highlight: { label: "Ngày khởi hành", value: formatDate(departure.date) },
    rows: [
      { label: "Số khách", value: String(guests) },
      { label: "Đơn giá / khách", value: formatVnd(departure.price) },
    ],
    totalAmount: departure.price * guests,
    cancellation: "Trước giờ khởi hành 24 giờ",
    tour: { departureId: departure.id, guests },
  };
}

/** Tóm tắt từ booking đã lưu (snapshot), dùng cho trang /bookings/[code] */
export function tourBookingSummary(b: TourBookingDetail): BookingSummary {
  const slug = b.tourDeparture?.tour.slug;
  return {
    kind: "tour",
    backHref: slug ? `/tours/${slug}` : "/explore?kind=tour",
    name: b.tourTitle,
    location: b.tourDeparture?.tour.province.name ?? "",
    highlight: { label: "Ngày khởi hành", value: formatDate(b.departureDate) },
    rows: [
      { label: "Số khách", value: String(b.guests) },
      { label: "Đơn giá / khách", value: formatVnd(Number(b.unitPrice)) },
    ],
    totalAmount: Number(b.totalAmount),
    cancellation: "Trước giờ khởi hành 24 giờ",
  };
}

export function hotelSummary(
  hotel: HotelDetail,
  q: BookingQuery,
): BookingSummary | null {
  const room = hotel.rooms.find((r) => r.id === str(q, "roomId"));
  const checkIn = str(q, "checkIn");
  const checkOut = str(q, "checkOut");
  if (!room || !checkIn || !checkOut || checkIn < todayIsoDate()) return null;
  const nights = Math.round(
    (new Date(`${checkOut}T00:00:00Z`).getTime() -
      new Date(`${checkIn}T00:00:00Z`).getTime()) /
      DAY,
  );
  if (!(nights > 0)) return null;
  const rooms = Math.min(int(q, "rooms", 1, 1), room.quantity);
  const guests = int(q, "guests", 1, 1);
  if (guests > room.capacity * rooms) return null;
  return {
    kind: "hotel",
    backHref: `/hotels/${hotel.slug}`,
    name: hotel.name,
    location: hotel.location,
    highlight: { label: "Nhận phòng", value: formatDate(checkIn) },
    rows: [
      { label: "Trả phòng", value: formatDate(checkOut) },
      { label: "Loại phòng", value: room.name },
      { label: "Số đêm", value: String(nights) },
      { label: "Số phòng", value: String(rooms) },
      { label: "Số khách", value: String(guests) },
      { label: "Đơn giá / đêm", value: formatVnd(room.basePrice) },
    ],
    totalAmount: room.basePrice * nights * rooms,
    cancellation: "Trước ngày nhận phòng 24 giờ",
    hotel: { roomId: room.id, checkIn, checkOut, rooms, guests },
  };
}

/** Tóm tắt từ booking khách sạn đã lưu (snapshot), dùng cho trang /bookings/[code] */
export function hotelBookingSummary(b: HotelBookingDetail): BookingSummary {
  const slug = b.room?.hotel.slug;
  return {
    kind: "hotel",
    backHref: slug ? `/hotels/${slug}` : "/explore?kind=hotel",
    name: b.hotelName,
    location: b.room?.hotel.province.name ?? "",
    highlight: { label: "Nhận phòng", value: formatDate(b.checkInDate) },
    rows: [
      { label: "Trả phòng", value: formatDate(b.checkOutDate) },
      { label: "Loại phòng", value: b.roomName },
      { label: "Số đêm", value: String(b.nights) },
      { label: "Số phòng", value: String(b.roomQuantity) },
      { label: "Số khách", value: String(b.guests) },
      { label: "Đơn giá / đêm", value: formatVnd(Number(b.unitPrice)) },
    ],
    totalAmount: Number(b.totalAmount),
    cancellation: "Trước ngày nhận phòng 24 giờ",
  };
}

export function restaurantSummary(
  restaurant: RestaurantDetail,
  q: BookingQuery,
): BookingSummary | null {
  const date = str(q, "date");
  const slot = restaurant.timeSlots.find((s) => s.startTime === str(q, "slot"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayIsoDate() || !slot) {
    return null;
  }
  const guests = int(q, "guests", 1, 2);
  if (guests > restaurant.capacity) return null;
  return {
    kind: "restaurant",
    backHref: `/restaurants/${restaurant.slug}`,
    name: restaurant.name,
    location: restaurant.location,
    highlight: { label: "Ngày đặt bàn", value: formatDate(date) },
    rows: [
      { label: "Giờ", value: `${slot.startTime} - ${slot.endTime}` },
      { label: "Số khách", value: String(guests) },
      { label: "Địa chỉ", value: restaurant.address },
    ],
    totalAmount: null,
    cancellation: `Trước giờ đặt bàn ${RESTAURANT_CANCEL_CUTOFF_HOURS} giờ`,
    restaurant: {
      restaurantSlug: restaurant.slug,
      date,
      slot: slot.startTime,
      guests,
    },
  };
}

/** Tóm tắt từ booking nhà hàng đã lưu (snapshot), dùng cho trang /bookings/[code] */
export function restaurantBookingSummary(
  b: RestaurantBookingDetail,
): BookingSummary {
  const slug = b.restaurant?.slug;
  const endTime = b.restaurantTimeSlot?.endTime;
  return {
    kind: "restaurant",
    backHref: slug ? `/restaurants/${slug}` : "/explore?kind=restaurant",
    name: b.restaurantName,
    location: b.restaurant?.province.name ?? "",
    highlight: { label: "Ngày đặt bàn", value: formatDate(b.reservationDate) },
    rows: [
      { label: "Giờ", value: endTime ? `${b.startTime} - ${endTime}` : b.startTime },
      { label: "Số khách", value: String(b.guests) },
      ...(b.restaurant ? [{ label: "Địa chỉ", value: b.restaurant.address }] : []),
    ],
    totalAmount: null,
    cancellation: `Trước giờ đặt bàn ${RESTAURANT_CANCEL_CUTOFF_HOURS} giờ`,
  };
}
