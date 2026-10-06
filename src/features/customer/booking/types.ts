export type BookingKind = "tour" | "hotel" | "restaurant";

export type SummaryRow = { label: string; value: string };

/**
 * Dữ liệu tóm tắt đơn đặt chỗ, map từ các cột snapshot của
 * TourBooking / HotelBooking / RestaurantBooking.
 */
export type BookingSummary = {
  kind: BookingKind;
  /** Link quay lại trang chi tiết */
  backHref: string;
  /** tourTitle | hotelName | restaurantName */
  name: string;
  location: string;
  /** Ô nổi bật phía trên (ngày khởi hành / nhận phòng / đặt bàn) */
  highlight: { label: string; value: string };
  rows: SummaryRow[];
  /** totalAmount (VND). null với nhà hàng — không thanh toán online */
  totalAmount: number | null;
  /** Nhãn hủy miễn phí lấy từ booking card */
  cancellation: string;
  /** Lựa chọn gửi lên server khi tạo booking tour */
  tour?: { departureId: string; guests: number };
};

export type ContactValues = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  note: string;
};
