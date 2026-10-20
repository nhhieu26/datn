import { BookingIcon } from "@/features/provider/tour-bookings/components/booking-icon";
import Link from "next/link";
import { buildCalendarUrl } from "../search-params";
import type { CalendarDay } from "../types";
import {
  CALENDAR_STATUS_GROUPS,
  WEEKDAY_LABELS,
  formatMonthTitle,
  groupEventsByStatus,
  shiftMonth,
} from "../utils";

const navButtonClass =
  "inline-flex size-8 items-center justify-center rounded-lg border border-layer-line bg-layer text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden";

function cellClass(day: CalendarDay) {
  if (day.isSelected) return "bg-primary/10";
  if (!day.inMonth) return "bg-surface/60 hover:bg-surface-hover";
  return "hover:bg-surface-hover";
}

function dayNumberClass(day: CalendarDay) {
  if (day.isToday) return "bg-primary text-primary-foreground";
  if (!day.inMonth) return "text-muted-foreground-1";
  return "text-foreground";
}

export function CalendarMonth({
  slug,
  month,
  days,
}: {
  slug: string;
  month: string;
  days: CalendarDay[];
}) {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-card-line bg-card shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 md:p-5">
        <div className="flex items-center gap-x-2">
          <h2 className="me-1 text-lg font-semibold text-foreground">
            {formatMonthTitle(month)}
          </h2>
          <Link
            aria-label="Tháng trước"
            className={navButtonClass}
            href={buildCalendarUrl(slug, { month: shiftMonth(month, -1) })}
            scroll={false}
          >
            <BookingIcon name="chevronLeft" />
          </Link>
          <Link
            aria-label="Tháng sau"
            className={navButtonClass}
            href={buildCalendarUrl(slug, { month: shiftMonth(month, 1) })}
            scroll={false}
          >
            <BookingIcon name="chevronRight" />
          </Link>
          <Link
            className="ms-1 text-sm font-medium text-primary hover:underline focus:underline focus:outline-hidden"
            href={buildCalendarUrl(slug)}
            scroll={false}
          >
            Hôm nay
          </Link>
        </div>

        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {CALENDAR_STATUS_GROUPS.map((group) => (
            <li
              key={group.key}
              className="inline-flex items-center gap-x-1.5 text-xs text-muted-foreground-1"
            >
              <span className={`size-2 rounded-full ${group.dotClass}`} />
              {group.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-7 border-y border-card-divider bg-surface">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-2.5 text-center text-xs font-medium tracking-wide text-muted-foreground-1 uppercase"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 [&>*:nth-child(7n)]:border-e-0 [&>*:nth-last-child(-n+7)]:border-b-0">
        {days.map((day) => {
          const groups = groupEventsByStatus(day.events);
          return (
            <Link
              key={day.iso}
              aria-current={day.isSelected ? "date" : undefined}
              aria-label={`${day.iso}: ${day.events.length} đơn đặt`}
              className={`flex min-h-16 flex-col gap-1 border-e border-b border-card-divider p-1.5 focus:outline-hidden sm:min-h-28 sm:p-2 ${cellClass(day)}`}
              href={buildCalendarUrl(slug, {
                month: day.iso.slice(0, 7),
                date: day.iso,
              })}
              scroll={false}
            >
              <span
                className={`inline-flex size-7 items-center justify-center rounded-full text-sm font-medium ${dayNumberClass(day)}`}
              >
                {day.day}
              </span>

              {/* Mobile: chỉ hiện chấm màu cho gọn */}
              <span className="flex flex-wrap gap-1 sm:hidden">
                {groups.map((group) => (
                  <span
                    key={group.key}
                    className={`size-1.5 rounded-full ${group.dotClass}`}
                  />
                ))}
              </span>

              <span className="hidden flex-col gap-1 sm:flex">
                {groups.map((group) => (
                  <span
                    key={group.key}
                    className={`truncate rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${group.pillClass}`}
                  >
                    {group.label} ({group.count})
                  </span>
                ))}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
