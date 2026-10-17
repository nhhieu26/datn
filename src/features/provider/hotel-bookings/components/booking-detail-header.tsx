import { BookingIcon, type BookingIconName } from "@/features/provider/tour-bookings/components/booking-icon";
import { formatDate } from "@/lib/utils";
import type { HotelBookingDetailView } from "../types";

/** Thẻ tổng quan đơn đặt phòng theo phong cách Preline. */
export function HotelBookingDetailHeader({
  booking,
}: {
  booking: HotelBookingDetailView;
}) {
  const location = booking.address ?? booking.provinceName;
  return (
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-5 md:p-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={booking.roomName}
        className="aspect-video w-full shrink-0 rounded-lg border border-card-line object-cover sm:aspect-4/3 sm:w-44"
        src={booking.imageUrl}
      />
      <div className="flex min-w-0 grow flex-col">
        <h2 className="text-lg font-semibold text-foreground">
          {booking.hotelName}
        </h2>
        <p className="text-sm text-muted-foreground-1">{booking.roomName}</p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Meta icon="calendar" label="Nhận phòng → Trả phòng">
            {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
          </Meta>
          <Meta icon="moon" label="Thời gian lưu trú">
            {booking.nights} đêm
          </Meta>
          <Meta icon="bed" label="Phòng & khách">
            {booking.roomQuantity} phòng · {booking.guests} khách
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
