import type { BookingKind } from "../types";

export const KIND_LABEL: Record<BookingKind, string> = {
  tour: "Tour",
  hotel: "Khách sạn",
  restaurant: "Nhà hàng",
};

// Tiền tố mã đặt chỗ, khớp formatEntityCode(prefix, id)
export const CODE_PREFIX: Record<BookingKind, string> = {
  tour: "TB",
  hotel: "HB",
  restaurant: "RB",
};

/** Nhãn nút đặt lại khi đơn hết hạn giữ chỗ / bị hủy */
export const REBOOK_LABEL: Record<BookingKind, string> = {
  tour: "Đặt lại tour",
  hotel: "Đặt lại phòng",
  restaurant: "Đặt lại bàn",
};

export function stepLabels(kind: BookingKind) {
  return kind === "restaurant"
    ? ["Thông tin đặt bàn", "Hoàn tất"]
    : ["Thông tin liên hệ", "Thanh toán", "Hoàn tất"];
}
