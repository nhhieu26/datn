import { formatDate, formatTourDuration } from "@/lib/utils";
import type { TourBookingDetailView } from "../types";
import { PaymentBadge, StatusBadge } from "./booking-badges";

export function BookingDetailHeader({
  booking,
}: {
  booking: TourBookingDetailView;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={booking.tourTitle}
        className="h-32 w-full shrink-0 rounded-xl object-cover ring-1 ring-slate-200/80 sm:w-48"
        src={booking.tourImageUrl}
      />
      <div className="flex min-w-0 flex-col justify-center gap-2">
        <span className="text-[11px] font-bold tracking-wider text-brand-600 uppercase">
          Mã đơn: {booking.code}
        </span>
        <h2 className="text-xl font-extrabold text-slate-900">
          {booking.tourTitle}
        </h2>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-600">
          <Meta icon="calendar_month">{formatDate(booking.departureDate)}</Meta>
          {booking.provinceName && (
            <Meta icon="location_on">{booking.provinceName}</Meta>
          )}
          {booking.duration && (
            <Meta icon="schedule">
              {formatTourDuration(
                booking.duration.days,
                booking.duration.nights,
              )}
            </Meta>
          )}
          <Meta icon="group">{booking.guests} khách</Meta>
        </div>
        <div className="mt-1 flex flex-wrap gap-2">
          <StatusBadge status={booking.status} />
          <PaymentBadge state={booking.paymentState} />
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
