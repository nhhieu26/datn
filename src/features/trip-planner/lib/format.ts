import type { Leg, Slot, Stop, TravelMode } from "./itinerary";

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

// Google Maps URLs không có chế độ xe máy → dùng ô tô, người dùng tự đổi trong Google Maps
const GOOGLE_TRAVEL_MODE: Record<TravelMode, string> = { car: "driving", motorbike: "driving", walk: "walking" };
// Giới hạn của Google Maps URLs: tối đa 9 điểm dừng giữa đường trong một link
const MAX_WAYPOINTS = 9;

type MapPoint = { lat: number; lng: number; googlePlaceId?: string | null };

/**
 * Link chỉ đường trên Google Maps (https://developers.google.com/maps/documentation/urls/get-started#directions-action)
 * đi lần lượt qua `points`. Có Place ID thì Google Maps hiện đúng tên địa điểm thay vì tọa độ.
 */
export function googleDirectionsUrl(points: MapPoint[], mode: TravelMode): string {
  const coord = (p: MapPoint) => `${p.lat},${p.lng}`;
  const origin = points[0];
  const destination = points[points.length - 1];
  const waypoints = points.slice(1, -1);

  const params = new URLSearchParams({ api: "1", origin: coord(origin), destination: coord(destination) });
  if (origin.googlePlaceId) params.set("origin_place_id", origin.googlePlaceId);
  if (destination.googlePlaceId) params.set("destination_place_id", destination.googlePlaceId);
  if (waypoints.length > 0) {
    params.set("waypoints", waypoints.map(coord).join("|"));
    // Chỉ gửi danh sách Place ID khi đủ cho mọi điểm, nếu không thứ tự sẽ lệch
    if (waypoints.every((p) => p.googlePlaceId)) {
      params.set("waypoint_place_ids", waypoints.map((p) => p.googlePlaceId).join("|"));
    }
  }
  params.set("travelmode", GOOGLE_TRAVEL_MODE[mode]);
  return `https://www.google.com/maps/dir/?${params}`;
}

/**
 * Các link chỉ đường cho cả ngày. Ngày quá nhiều điểm thì chia thành nhiều đoạn nối tiếp
 * (điểm cuối đoạn trước là điểm đầu đoạn sau). Bỏ các điểm trùng liền kề (vd ăn sáng tại khách sạn).
 */
export function googleDirectionsUrlsForDay(stops: Stop[], mode: TravelMode): string[] {
  const points: MapPoint[] = [];
  stops.forEach((s, i) => {
    if (i === 0 || stops[i - 1].placeId !== s.placeId) points.push(s.place);
  });
  if (points.length < 2) return [];

  const perLink = MAX_WAYPOINTS + 2;
  const urls: string[] = [];
  for (let start = 0; start < points.length - 1; start += perLink - 1) {
    urls.push(googleDirectionsUrl(points.slice(start, start + perLink), mode));
  }
  return urls;
}

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
