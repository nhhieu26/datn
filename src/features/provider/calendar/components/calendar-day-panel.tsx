import { BookingIcon } from "@/features/provider/tour-bookings/components/booking-icon";
import { PrelineStatusBadge } from "@/features/provider/tour-bookings/components/tour-booking-status";
import Link from "next/link";
import { buildCalendarUrl } from "../search-params";
import type { CalendarEvent } from "../types";
import { formatDayMonth } from "../utils";

export function CalendarDayPanel({
  slug,
  date,
  today,
  events,
}: {
  slug: string;
  date: string;
  today: string;
  events: CalendarEvent[];
}) {
  return (
    <aside className="flex flex-col self-start rounded-xl border border-card-line bg-card shadow-2xs lg:sticky lg:top-4">
      <div className="flex items-center justify-between gap-3 p-4 md:p-5">
        <div>
          <h2 className="font-semibold text-foreground">
            Ngày {formatDayMonth(date)}/{date.slice(0, 4)}
          </h2>
          <p className="text-sm text-muted-foreground-1">
            {events.length > 0
              ? `${events.length} đơn đặt`
              : "Không có đơn đặt"}
          </p>
        </div>
        {date !== today && (
          <Link
            className="text-sm font-medium text-primary hover:underline focus:underline focus:outline-hidden"
            href={buildCalendarUrl(slug)}
            scroll={false}
          >
            Hôm nay
          </Link>
        )}
      </div>

      <div className="border-t border-card-divider p-4 md:p-5">
        {events.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-card-line px-4 py-8 text-center">
            <BookingIcon name="calendar" className="size-6 text-muted-foreground-1" />
            <p className="mt-2 text-sm text-muted-foreground-1">
              Không có đơn đặt nào trong ngày này.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li
                key={event.code}
                className="rounded-lg border border-card-line bg-surface p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground-1">
                    {event.code}
                  </span>
                  <PrelineStatusBadge status={event.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-semibold text-foreground">
                  {event.title}
                </p>
                {event.subtitle && (
                  <p className="text-sm text-muted-foreground-1">{event.subtitle}</p>
                )}
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground-1">
                  <li className="flex items-center gap-x-2">
                    <BookingIcon name="calendar" className="size-3.5" />
                    {event.schedule}
                  </li>
                  <li className="flex items-center gap-x-2">
                    <BookingIcon name="user" className="size-3.5" />
                    <span className="truncate">{event.contactName}</span>
                  </li>
                  <li className="flex items-center gap-x-2">
                    <BookingIcon name="users" className="size-3.5" />
                    {event.guests} khách
                    {event.amount && (
                      <span className="ms-auto font-medium text-foreground">
                        {event.amount}
                      </span>
                    )}
                  </li>
                </ul>
                <Link
                  className="mt-3 inline-flex w-full items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer px-3 py-2 text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden"
                  href={`/provider/bookings/${slug}/${event.code}`}
                >
                  Xem chi tiết đơn
                  <BookingIcon name="arrowRight" className="size-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
