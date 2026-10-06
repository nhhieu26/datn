import { formatDate } from "@/lib/utils";
import type { RestaurantBookingDetailView } from "../types";
import { formatTimeRange } from "../utils";
import { RestaurantBookingStatusMenu } from "./restaurant-booking-status-menu";

export function RestaurantBookingDetailHeader({
  booking,
}: {
  booking: RestaurantBookingDetailView;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={booking.restaurantName}
        className="h-32 w-full shrink-0 rounded-xl object-cover ring-1 ring-slate-200/80 sm:w-48"
        src={booking.imageUrl}
      />
      <div className="flex min-w-0 flex-col justify-center gap-2">
        <span className="text-[11px] font-bold tracking-wider text-brand-600 uppercase">
          Mã đơn: {booking.code}
        </span>
        <h2 className="text-xl font-extrabold text-slate-900">
          {booking.restaurantName}
        </h2>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-600">
          <Meta icon="calendar_month">{formatDate(booking.reservationDate)}</Meta>
          <Meta icon="schedule">
            {formatTimeRange(booking.startTime, booking.endTime)}
          </Meta>
          <Meta icon="group">{booking.guests} khách</Meta>
          {(booking.address || booking.provinceName) && (
            <Meta icon="location_on">
              {booking.address ?? booking.provinceName}
            </Meta>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-2">
          <RestaurantBookingStatusMenu booking={booking} />
        </div>
      </div>
    </div>
  );
}

function Meta({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="material-symbols-outlined text-[18px] text-brand-600">
        {icon}
      </span>
      {children}
    </span>
  );
}
