import type { TourStop } from "@/entities/tour/schema";

export type RouteStop = {
  /** Thứ tự trên toàn lộ trình, bắt đầu từ 1 */
  order: number;
  day: number;
  name: string;
  address: string | null;
  placeId: string;
  latitude: number;
  longitude: number;
};

const MAX_DIRECTIONS_STOPS = 11; // điểm đầu + điểm cuối + 9 waypoint (giới hạn của Maps URLs)

/**
 * Các điểm provider đã chọn từ Google Maps (có tọa độ), theo thứ tự ngày, bỏ điểm trùng liền kề.
 * Không đoán vị trí từ chữ `location` cũ — Google dễ ghim nhầm chỗ.
 */
export function getRouteStops(itinerary: { stops?: TourStop[] }[]): {
  stops: RouteStop[];
  /** Các ngày (bắt đầu từ 1) chưa có điểm trên bản đồ */
  missingDays: number[];
} {
  const stops: RouteStop[] = [];
  const missingDays: number[] = [];
  itinerary.forEach((day, i) => {
    if (!day.stops?.length) {
      missingDays.push(i + 1);
      return;
    }
    for (const s of day.stops) {
      if (stops.at(-1)?.placeId === s.placeId) continue;
      stops.push({
        order: stops.length + 1,
        day: i + 1,
        name: s.name,
        address: s.address,
        placeId: s.placeId,
        latitude: s.latitude,
        longitude: s.longitude,
      });
    }
  });
  return { stops, missingDays };
}

/** Một ngày có thể ghi nhiều điểm, cách nhau bằng " - " (VD "Tràng An - Hang Múa") */
export function splitDayLocation(location: string | undefined): string[] {
  return (location ?? "")
    .split(/\s+[-–→]\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Tên các điểm của một ngày để hiển thị */
export function dayStopLabels(day: {
  location?: string;
  stops?: TourStop[];
}): string[] {
  return day.stops?.length
    ? day.stops.map((s) => s.name)
    : splitDayLocation(day.location);
}

/** Giữ điểm đầu, điểm cuối và lấy đều các điểm giữa nếu vượt giới hạn */
function limitStops<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  const step = (items.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => items[Math.round(i * step)]);
}

// Địa chỉ Google đôi khi đã bắt đầu bằng tên ("Hang Múa, Hang Múa, …")
const stopQuery = (s: RouteStop) =>
  !s.address
    ? s.name
    : s.address.startsWith(s.name)
      ? s.address
      : `${s.name}, ${s.address}`;

/** Link mở Google Maps (web/app) để xem chỉ đường qua các điểm */
export function buildDirectionsUrl(
  stops: RouteStop[],
  province: string,
): string {
  const picked = limitStops(stops, MAX_DIRECTIONS_STOPS);
  if (picked.length < 2) {
    const params = new URLSearchParams({
      api: "1",
      query: picked[0] ? stopQuery(picked[0]) : `${province}, Việt Nam`,
    });
    if (picked[0]) params.set("query_place_id", picked[0].placeId);
    return `https://www.google.com/maps/search/?${params}`;
  }
  const first = picked[0];
  const last = picked.at(-1)!;
  const middle = picked.slice(1, -1);
  const params = new URLSearchParams({
    api: "1",
    origin: stopQuery(first),
    origin_place_id: first.placeId,
    destination: stopQuery(last),
    destination_place_id: last.placeId,
    travelmode: "driving",
  });
  if (middle.length) {
    params.set("waypoints", middle.map(stopQuery).join("|"));
    params.set("waypoint_place_ids", middle.map((s) => s.placeId).join("|"));
  }
  return `https://www.google.com/maps/dir/?${params}`;
}
