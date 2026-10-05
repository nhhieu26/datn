import type { HotelDetail } from "@/features/customer/hotel-detail/lib/to-hotel-detail";
import type { RestaurantDetail } from "@/features/customer/restaurant-detail/lib/restaurant-detail";
import type { TourDetail } from "@/features/customer/tour-detail/lib/to-tour-detail";
import { formatDate } from "@/lib/utils";
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
  };
}

export function hotelSummary(
  hotel: HotelDetail,
  q: BookingQuery,
): BookingSummary | null {
  const room = hotel.rooms.find((r) => r.id === str(q, "roomId"));
  const checkIn = str(q, "checkIn");
  const checkOut = str(q, "checkOut");
  if (!room || !checkIn || !checkOut) return null;
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
  };
}

export function restaurantSummary(
  restaurant: RestaurantDetail,
  q: BookingQuery,
): BookingSummary | null {
  const date = str(q, "date");
  const slot = restaurant.timeSlots.find((s) => s.startTime === str(q, "slot"));
  if (!date || !slot) return null;
  const guests = Math.min(int(q, "guests", 1, 2), restaurant.capacity);
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
    cancellation: "Trước giờ đặt bàn 2 giờ",
  };
}
