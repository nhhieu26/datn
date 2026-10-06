import {
  PaymentBadge,
  StatusBadge,
} from "@/features/provider/tour-bookings/components/booking-badges";
import { formatDate } from "@/lib/utils";
import type { HotelBookingDetailView } from "../types";

export function HotelBookingDetailHeader({
  booking,
}: {
  booking: HotelBookingDetailView;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={booking.roomName}
        className="h-32 w-full shrink-0 rounded-xl object-cover ring-1 ring-slate-200/80 sm:w-48"
        src={booking.imageUrl}
      />
      <div className="flex min-w-0 flex-col justify-center gap-2">
        <span className="text-[11px] font-bold tracking-wider text-brand-600 uppercase">
          Mã đơn: {booking.code}
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {booking.hotelName}
          </h2>
          <p className="mt-0.5 text-sm font-medium text-slate-500">
            {booking.roomName}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-600">
          <Meta icon="calendar_month">
            {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
          </Meta>
          <Meta icon="dark_mode">{booking.nights} đêm</Meta>
          {(booking.address || booking.provinceName) && (
            <Meta icon="location_on">
              {booking.address ?? booking.provinceName}
            </Meta>
          )}
          <Meta icon="bed">
            {booking.roomQuantity} phòng · {booking.guests} khách
          </Meta>
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
