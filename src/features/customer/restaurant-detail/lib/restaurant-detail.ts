export type RestaurantMenuItem = {
  name: string;
  description: string;
  price: number;
};

export type RestaurantTimeSlot = { startTime: string; endTime: string };

// Mirrors the Restaurant Prisma model (province flattened to `location`).
export type RestaurantDetail = {
  name: string;
  slug: string;
  location: string;
  address: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string;
  capacity: number;
  images: { url: string }[];
  menu: RestaurantMenuItem[];
  tags: string[];
  timeSlots: RestaurantTimeSlot[];
};

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Merge contiguous 30-minute slots into ranges, e.g. 06:00-22:30.
export function groupTimeSlots(slots: RestaurantTimeSlot[]) {
  const sorted = [...slots].sort(
    (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime),
  );
  const ranges: { start: string; end: string }[] = [];
  for (const s of sorted) {
    const last = ranges[ranges.length - 1];
    if (last && last.end === s.startTime) last.end = s.endTime;
    else ranges.push({ start: s.startTime, end: s.endTime });
  }
  return ranges;
}

export function openingLabel(slots: RestaurantTimeSlot[]) {
  return groupTimeSlots(slots)
    .map((r) => `${r.start} - ${r.end}`)
    .join(", ");
}

export function minMenuPrice(menu: RestaurantMenuItem[]) {
  return menu.length ? Math.min(...menu.map((m) => m.price)) : undefined;
}
