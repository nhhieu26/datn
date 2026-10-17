"use client";

import { reservationInstant } from "@/lib/utils";
import {
  BookingIcon,
  type BookingIconName,
} from "@/features/provider/tour-bookings/components/booking-icon";
import { PrelineStatusModal } from "@/features/provider/tour-bookings/components/tour-booking-status";
import type { ProviderBookingTransition } from "@/features/provider/tour-bookings/types";
import type { BookingStatus } from "@/generated/prisma/enums";
import { useState } from "react";
import { createPortal } from "react-dom";
import { updateRestaurantBookingStatusAction } from "../actions";
import { RESTAURANT_PROVIDER_TRANSITIONS } from "../utils";

const actionItems: Record<
  ProviderBookingTransition,
  { label: string; icon: BookingIconName; className: string }
> = {
  confirmed: {
    label: "Xác nhận đơn",
    icon: "check",
    className:
      "border-primary-line bg-primary text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus",
  },
  completed: {
    label: "Hoàn thành đơn",
    icon: "checkCheck",
    className:
      "border-primary-line bg-primary text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus",
  },
  cancelled: {
    label: "Hủy đơn",
    icon: "circleX",
    className:
      "border-layer-line bg-layer text-red-600 shadow-2xs hover:bg-red-50 focus:bg-red-50",
  },
};

/** Các nút đổi trạng thái đơn đặt bàn theo phong cách Preline. */
export function RestaurantBookingStatusActions({
  booking,
}: {
  booking: {
    code: string;
    status: BookingStatus;
    restaurantName: string;
    guests: number;
    reservationDate: string;
    startTime: string;
  };
}) {
  const [target, setTarget] = useState<ProviderBookingTransition | null>(null);
  const transitions = RESTAURANT_PROVIDER_TRANSITIONS[booking.status] ?? [];
  if (transitions.length === 0) return null;

  const completedBlocked =
    reservationInstant(booking.reservationDate, booking.startTime) >
    new Date();
  const config = {
    noun: "đặt bàn",
    subtitle: booking.restaurantName,
    cancelEffect: `trả lại ${booking.guests} chỗ cho khung giờ đã đặt`,
    completeBlockedHint: completedBlocked ? "Chưa qua giờ đặt bàn" : null,
    transitions: RESTAURANT_PROVIDER_TRANSITIONS,
    descriptions: {
      confirmed:
        "Khách hàng sẽ thấy đơn đặt bàn đã được nhà hàng xác nhận. Bạn vẫn có thể hủy đơn sau khi xác nhận.",
      completed:
        "Đánh dấu đơn đã phục vụ xong sau giờ đặt bàn. Đơn sẽ kết thúc ở trạng thái hoàn thành.",
      cancelled: `Đơn sẽ bị hủy và trả lại ${booking.guests} chỗ cho khung giờ đã đặt. Lý do hủy sẽ được gửi cho khách. Thao tác không thể hoàn tác.`,
    },
    onSubmit: updateRestaurantBookingStatusAction,
  };

  // Nút hủy đứng trước, nút chính (xác nhận/hoàn thành) đứng cuối
  const ordered = [...transitions].sort(
    (a, b) => Number(b === "cancelled") - Number(a === "cancelled"),
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {ordered.map((status) => {
          const item = actionItems[status];
          const blockedHint =
            status === "completed" ? config.completeBlockedHint : null;
          return (
            <button
              className={`inline-flex items-center justify-center gap-x-2 rounded-lg border px-3 py-2 text-sm font-medium focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 ${item.className}`}
              disabled={blockedHint != null}
              key={status}
              onClick={() => setTarget(status)}
              title={blockedHint ?? undefined}
              type="button"
            >
              <BookingIcon name={item.icon} />
              {item.label}
            </button>
          );
        })}
      </div>

      {target
        ? createPortal(
            <PrelineStatusModal
              booking={booking}
              config={config}
              onClose={() => setTarget(null)}
              target={target}
            />,
            document.body,
          )
        : null}
    </>
  );
}
