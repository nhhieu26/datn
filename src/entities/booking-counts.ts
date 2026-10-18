import type { BookingStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// Chỉ booking đã hoàn tất mới tính là lượt đặt
const COUNTED: BookingStatus[] = ["completed"];

function sumBy(
  groups: { _count: { _all: number } }[],
  keyOf: (index: number) => string | undefined,
) {
  const map = new Map<string, number>();
  groups.forEach((g, i) => {
    const key = keyOf(i);
    if (key) map.set(key, (map.get(key) ?? 0) + g._count._all);
  });
  return map;
}

export async function tourBookingCounts(): Promise<Map<string, number>> {
  const groups = await prisma.tourBooking.groupBy({
    by: ["tourDepartureId"],
    where: { status: { in: COUNTED }, tourDepartureId: { not: null } },
    _count: { _all: true },
  });
  const departures = await prisma.tourDeparture.findMany({
    where: { id: { in: groups.map((g) => g.tourDepartureId!) } },
    select: { id: true, tourId: true },
  });
  const tourOf = new Map(departures.map((d) => [d.id, d.tourId]));
  return sumBy(groups, (i) => tourOf.get(groups[i].tourDepartureId!));
}

export function tourBookingCount(tourId: string): Promise<number> {
  return prisma.tourBooking.count({
    where: { status: { in: COUNTED }, tourDeparture: { tourId } },
  });
}

export async function hotelBookingCounts(): Promise<Map<string, number>> {
  const groups = await prisma.hotelBooking.groupBy({
    by: ["roomId"],
    where: { status: { in: COUNTED }, roomId: { not: null } },
    _count: { _all: true },
  });
  const rooms = await prisma.room.findMany({
    where: { id: { in: groups.map((g) => g.roomId!) } },
    select: { id: true, hotelId: true },
  });
  const hotelOf = new Map(rooms.map((r) => [r.id, r.hotelId]));
  return sumBy(groups, (i) => hotelOf.get(groups[i].roomId!));
}

export async function restaurantBookingCounts(): Promise<Map<string, number>> {
  const groups = await prisma.restaurantBooking.groupBy({
    by: ["restaurantId"],
    where: { status: { in: COUNTED }, restaurantId: { not: null } },
    _count: { _all: true },
  });
  return sumBy(groups, (i) => groups[i].restaurantId ?? undefined);
}
