import {
  BookingIcon,
  type BookingIconName,
} from "@/features/provider/tour-bookings/components/booking-icon";
import { formatDate } from "@/lib/utils";
import type { RestaurantBookingDetailView } from "../types";
import { formatTimeRange } from "../utils";

/** Thẻ tổng quan đơn đặt bàn theo phong cách Preline. */
export function RestaurantBookingDetailHeader({
  booking,
}: {
  booking: RestaurantBookingDetailView;
}) {
  const location = booking.address ?? booking.provinceName;
  return (
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-5 md:p-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={booking.restaurantName}
        className="aspect-video w-full shrink-0 rounded-lg border border-card-line object-cover sm:aspect-4/3 sm:w-44"
        src={booking.imageUrl}
      />
      <div className="flex min-w-0 grow flex-col">
        <h2 className="text-lg font-semibold text-foreground">
          {booking.restaurantName}
        </h2>
        {booking.provinceName && (
          <p className="text-sm text-muted-foreground-1">
            {booking.provinceName}
          </p>
        )}

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Meta icon="calendar" label="Ngày đặt bàn">
            {formatDate(booking.reservationDate)}
          </Meta>
          <Meta icon="clock" label="Khung giờ">
            {formatTimeRange(booking.startTime, booking.endTime)}
          </Meta>
          <Meta icon="users" label="Số khách">
            {booking.guests} khách
          </Meta>
          {location && (
            <Meta icon="mapPin" label="Địa chỉ">
              {location}
            </Meta>
          )}
        </dl>
      </div>
    </div>
  );
}

function Meta({
  icon,
  label,
  children,
}: {
  icon: BookingIconName;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-x-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface text-surface-foreground">
        <BookingIcon name={icon} />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground-1">{label}</dt>
        <dd className="text-sm font-medium text-foreground">{children}</dd>
      </div>
    </div>
  );
}
