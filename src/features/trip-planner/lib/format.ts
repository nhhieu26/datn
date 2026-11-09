import type { Leg, Slot, TravelMode } from "./itinerary";

/** Giải mã Encoded Polyline của Google thành danh sách [lat, lng]. */
export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const next = () => {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };
  while (index < encoded.length) {
    lat += next();
    lng += next();
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

export const formatKm = (meters: number) =>
  meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} km`;

export function formatDuration(minutes: number) {
  const m = Math.max(1, Math.round(minutes));
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h} giờ ${m % 60} phút` : `${h} giờ`;
}

export const totals = (legs: (Leg | null)[]) => ({
  distanceM: legs.reduce((s, l) => s + (l?.distanceM ?? 0), 0),
  durationMin: legs.reduce((s, l) => s + (l?.durationS ?? 0), 0) / 60,
});

export const MODE_LABEL: Record<TravelMode, string> = { car: "Ô tô", motorbike: "Xe máy", walk: "Đi bộ" };

export const SLOT_LABEL: Record<Slot, string> = {
  hotel: "Khách sạn",
  breakfast: "Bữa sáng",
  lunch: "Bữa trưa",
  dinner: "Bữa tối",
  visit: "Tham quan",
};

export const SLOT_COLOR: Record<Slot, string> = {
  hotel: "#6366f1",
  breakfast: "#f06449",
  lunch: "#f06449",
  dinner: "#f06449",
  visit: "#017b6e",
};
