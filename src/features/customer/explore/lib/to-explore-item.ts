import { average, menuAveragePrice } from "@/entities/list-filter";
import type { destinationRepo } from "@/entities/destination";
import type { hotelRepo } from "@/entities/hotel";
import type { restaurantRepo } from "@/entities/restaurant";
import type { tourRepo } from "@/entities/tour";
import { firstImage } from "@/features/customer/components/cards/card-parts";
import type { ExploreItem } from "../data";

type TourRow = Awaited<ReturnType<typeof tourRepo.findPaged>>["items"][number];
type HotelRow = Awaited<ReturnType<typeof hotelRepo.findPaged>>["items"][number];
type RestaurantRow = Awaited<
  ReturnType<typeof restaurantRepo.findPaged>
>["items"][number];
type DestinationRow = Awaited<
  ReturnType<typeof destinationRepo.findPaged>
>["items"][number];

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

// Prisma Decimal không truyền được sang Client Component → map sang ExploreItem (price là number)
export function toTourItem(t: TourRow): ExploreItem {
  return {
    id: t.id,
    createdAt: t.createdAt.getTime(),
    kind: "tour",
    href: `/tours/${t.slug}`,
    title: t.title,
    location: t.province.name,
    image: firstImage(t.images),
    price: Number(t.basePrice),
    meta: [
      `${t.durationDays} ngày ${t.durationNights} đêm`,
      `${t._count.departures} lịch khởi hành`,
    ],
  };
}

export function toHotelItem(h: HotelRow): ExploreItem {
  const capacity = Math.max(0, ...h.rooms.map((r) => r.capacity));
  return {
    id: h.id,
    createdAt: h.createdAt.getTime(),
    kind: "hotel",
    href: `/hotels/${h.slug}`,
    title: h.name,
    location: h.province.name,
    image: firstImage(h.images),
    price: average(h.rooms.map((r) => Number(r.basePrice))),
    meta: [
      `${h.rooms.length} loại phòng`,
      capacity ? `Tối đa ${capacity} khách` : "—",
    ],
  };
}

export function toRestaurantItem(r: RestaurantRow): ExploreItem {
  const starts = r.timeSlots.map((s) => s.startTime).sort();
  const ends = r.timeSlots.map((s) => s.endTime).sort();
  return {
    id: r.id,
    createdAt: r.createdAt.getTime(),
    kind: "restaurant",
    href: `/restaurants/${r.slug}`,
    title: r.name,
    location: r.province.name,
    image: firstImage(r.images),
    price: menuAveragePrice(r.menu),
    meta: [
      `Sức chứa ${r.capacity}`,
      starts.length ? `${starts[0]} - ${ends[ends.length - 1]}` : "—",
    ],
  };
}

export function toDestinationItem(d: DestinationRow): ExploreItem {
  const price = d.ticketPrice === null ? undefined : Number(d.ticketPrice);
  return {
    id: d.id,
    createdAt: d.createdAt.getTime(),
    kind: "destination",
    href: `/destinations/${d.slug}`,
    title: d.name,
    location: d.province.name,
    image: firstImage(d.images),
    price,
    meta: [price ? `Vé ${formatMoney(price)}` : "Miễn phí", d.province.name],
  };
}
