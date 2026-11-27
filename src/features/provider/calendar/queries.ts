import { hotelRepo } from "@/entities/hotel";
import { hotelBookingRepo } from "@/entities/hotel-booking";
import { restaurantRepo } from "@/entities/restaurant";
import { restaurantBookingRepo } from "@/entities/restaurant-booking";
import { tourRepo } from "@/entities/tour";
import { tourBookingRepo } from "@/entities/tour-booking";
import type { BusinessType } from "@/generated/prisma/client";
import { formatCurrency } from "@/lib/utils";
import type { CalendarEvent, CalendarServiceOption } from "./types";
import { formatDayMonth, nextIsoDay, toIsoDay } from "./utils";

type FindEvents = (
  providerProfileId: string,
  from: Date,
  to: Date,
  serviceId?: string,
) => Promise<CalendarEvent[]>;

const SOURCES: Record<BusinessType, FindEvents> = {
  tour: async (id, from, to, serviceId) =>
    (await tourBookingRepo.findForCalendar(id, from, to, serviceId)).map(
      (b) => {
        const start = toIsoDay(b.departureDate);
        return {
          code: b.code,
          status: b.status,
          title: b.tourTitle,
          subtitle: null,
          schedule: `Khởi hành ${formatDayMonth(start)}`,
          guests: b.guests,
          contactName: b.contactName,
          amount: formatCurrency(Number(b.totalAmount)),
          start,
          end: nextIsoDay(start),
        };
      },
    ),
  hotel: async (id, from, to, serviceId) =>
    (await hotelBookingRepo.findForCalendar(id, from, to, serviceId)).map(
      (b) => {
        const start = toIsoDay(b.checkInDate);
        const end = toIsoDay(b.checkOutDate);
        return {
          code: b.code,
          status: b.status,
          title: b.hotelName,
          subtitle: `${b.roomQuantity} × ${b.roomName}`,
          schedule: `${formatDayMonth(start)} → ${formatDayMonth(end)} · ${b.nights} đêm`,
          guests: b.guests,
          contactName: b.contactName,
          amount: formatCurrency(Number(b.totalAmount)),
          start,
          // Phòng trả cùng ngày nhận vẫn hiển thị trên ngày nhận
          end: end > start ? end : nextIsoDay(start),
        };
      },
    ),
  restaurant: async (id, from, to, serviceId) =>
    (await restaurantBookingRepo.findForCalendar(id, from, to, serviceId)).map(
      (b) => {
        const start = toIsoDay(b.reservationDate);
        return {
          code: b.code,
          status: b.status,
          title: b.restaurantName,
          subtitle: null,
          schedule: `${formatDayMonth(start)} · ${b.startTime}`,
          guests: b.guests,
          contactName: b.contactName,
          amount: null,
          start,
          end: nextIsoDay(start),
        };
      },
    ),
};

export function getCalendarEvents(
  kind: BusinessType,
  providerProfileId: string,
  from: Date,
  to: Date,
  serviceId?: string,
) {
  return SOURCES[kind](providerProfileId, from, to, serviceId);
}

/** Các tour/khách sạn/nhà hàng của provider để chọn lọc lịch. */
export async function getCalendarServiceOptions(
  kind: BusinessType,
  providerProfileId: string,
): Promise<CalendarServiceOption[]> {
  switch (kind) {
    case "tour":
      return (
        await tourRepo.findOptionsByProviderProfileId(providerProfileId)
      ).map((t) => ({ id: t.id, name: t.title }));
    case "hotel":
      return hotelRepo.findOptionsByProviderProfileId(providerProfileId);
    case "restaurant":
      return restaurantRepo.findOptionsByProviderProfileId(providerProfileId);
  }
}
