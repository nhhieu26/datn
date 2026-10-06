import type {
  HotelBookingProviderDetail,
  HotelBookingWithPayment,
} from "@/entities/hotel-booking";
import {
  extractTourImageUrl,
  getPaymentState,
} from "@/features/provider/tour-bookings/utils";
import type { HotelBookingDetailView, HotelBookingListItem } from "./types";

function extractRoomImageUrl(
  room: { images: unknown; hotel: { images: unknown } } | null,
): string {
  const roomImages = room?.images;
  // Phòng không có ảnh (hoặc đã bị xóa) thì lấy ảnh khách sạn
  return Array.isArray(roomImages) && roomImages.length > 0
    ? extractTourImageUrl(roomImages)
    : extractTourImageUrl(room?.hotel.images);
}

export function mapHotelBookingToListItem(
  booking: HotelBookingWithPayment,
): HotelBookingListItem {
  return {
    id: booking.id,
    code: booking.code,
    hotelName: booking.hotelName,
    roomName: booking.roomName,
    imageUrl: extractRoomImageUrl(booking.room),
    customerName: booking.contactName,
    customerPhone: booking.contactPhone,
    customerEmail: booking.contactEmail,
    checkInDate: booking.checkInDate.toISOString(),
    checkOutDate: booking.checkOutDate.toISOString(),
    nights: booking.nights,
    roomQuantity: booking.roomQuantity,
    guests: booking.guests,
    totalAmount: Number(booking.totalAmount),
    providerAmount: Number(booking.providerAmount),
    paymentState: getPaymentState(booking),
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
  };
}

const iso = (d: Date | null) => (d ? d.toISOString() : null);

export function mapHotelBookingToDetail(
  booking: HotelBookingProviderDetail,
): HotelBookingDetailView {
  const hotel = booking.room?.hotel;
  const succeeded = booking.payments.find((p) => p.status === "succeeded");
  const payment = succeeded ?? booking.payments[0] ?? null;
  return {
    code: booking.code,
    status: booking.status,
    paymentState: getPaymentState(booking),
    hotelName: booking.hotelName,
    roomName: booking.roomName,
    imageUrl: extractRoomImageUrl(booking.room),
    provinceName: hotel?.province.name ?? null,
    address: hotel?.address ?? null,
    checkInDate: booking.checkInDate.toISOString(),
    checkOutDate: booking.checkOutDate.toISOString(),
    nights: booking.nights,
    roomQuantity: booking.roomQuantity,
    guests: booking.guests,
    unitPrice: Number(booking.unitPrice),
    totalAmount: Number(booking.totalAmount),
    commissionRate: Number(booking.commissionRate),
    platformFee: Number(booking.platformFee),
    providerAmount: Number(booking.providerAmount),
    contactName: booking.contactName,
    contactEmail: booking.contactEmail,
    contactPhone: booking.contactPhone,
    accountName: booking.customer.fullname,
    note: booking.note,
    cancelReason: booking.cancelReason,
    expiresAt: iso(booking.expiresAt),
    createdAt: booking.createdAt.toISOString(),
    paidAt: iso(succeeded?.paidAt ?? null),
    confirmedAt: iso(booking.confirmedAt),
    completedAt: iso(booking.completedAt),
    cancelledAt: iso(booking.cancelledAt),
    payment: payment && {
      gateway: payment.gateway,
      status: payment.status,
      chargedAmount: String(payment.chargedAmount),
      chargedCurrency: payment.chargedCurrency,
      gatewayOrderId: payment.gatewayOrderId,
    },
    refundedAmount: booking.refunds
      .filter((r) => r.status === "succeeded")
      .reduce((sum, r) => sum + Number(r.amount), 0),
    payout: booking.payout
      ? { status: booking.payout.status, paidAt: iso(booking.payout.paidAt) }
      : null,
  };
}
