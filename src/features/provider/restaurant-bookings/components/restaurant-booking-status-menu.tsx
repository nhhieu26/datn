"use client";

import { BookingStatusMenu } from "@/features/provider/tour-bookings/components/booking-status-menu";
import type { BookingStatus } from "@/generated/prisma/enums";
import { updateRestaurantBookingStatusAction } from "../actions";
import { RESTAURANT_PROVIDER_TRANSITIONS } from "../utils";

export function RestaurantBookingStatusMenu({
  booking,
}: {
  booking: {
    code: string;
    status: BookingStatus;
    restaurantName: string;
    guests: number;
  };
}) {
  return (
    <BookingStatusMenu
      booking={booking}
      config={{
        noun: "đặt bàn",
        subtitle: booking.restaurantName,
        cancelEffect: `trả lại ${booking.guests} chỗ cho khung giờ đã đặt`,
        transitions: RESTAURANT_PROVIDER_TRANSITIONS,
        descriptions: {
          confirmed:
            "Khách hàng sẽ thấy đơn đặt bàn đã được nhà hàng xác nhận. Bạn vẫn có thể hủy đơn sau khi xác nhận.",
          cancelled: `Đơn sẽ bị hủy và trả lại ${booking.guests} chỗ cho khung giờ đã đặt. Lý do hủy sẽ được gửi cho khách. Thao tác không thể hoàn tác.`,
        },
        onSubmit: updateRestaurantBookingStatusAction,
      }}
    />
  );
}
