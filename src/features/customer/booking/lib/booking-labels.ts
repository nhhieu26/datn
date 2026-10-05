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

// ponytail: tỉ giá giả để demo, thay bằng tỉ giá thật khi có backend PayPal
export const MOCK_USD_RATE = 25_000;

export function stepLabels(kind: BookingKind) {
  return kind === "restaurant"
    ? ["Thông tin đặt bàn", "Hoàn tất"]
    : ["Thông tin liên hệ", "Thanh toán", "Hoàn tất"];
}
