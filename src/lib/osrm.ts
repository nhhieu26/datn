// Client tối giản cho OSRM (Open Source Routing Machine): khoảng cách, thời gian và đường đi theo đường bộ thực tế.
// Mặc định dùng máy chủ demo công cộng — chỉ phù hợp lưu lượng nhỏ; đặt OSRM_URL để dùng máy chủ riêng.
// http://project-osrm.org/docs/v5.24.0/api/

const DEFAULT_OSRM_URL = "https://router.project-osrm.org";
const PROFILE = "driving";
const TIMEOUT_MS = 10_000;

export type LatLng = { latitude: number; longitude: number };

export type RouteMatrix = {
  // giây / mét; null nếu không có đường bộ giữa hai điểm
  durations: (number | null)[][];
  distances: (number | null)[][];
};

export type RouteLeg = { distanceM: number; durationS: number };

export type RoadRoute = {
  distanceM: number;
  durationS: number;
  // GeoJSON LineString: [longitude, latitude][]
  geometry: [number, number][];
  legs: RouteLeg[];
};

const baseUrl = () => (process.env.OSRM_URL || DEFAULT_OSRM_URL).replace(/\/+$/, "");

// OSRM nhận tọa độ dạng "lng,lat;lng,lat"
const toCoordinates = (points: LatLng[]) =>
  points.map((p) => `${p.longitude.toFixed(6)},${p.latitude.toFixed(6)}`).join(";");

async function request<T extends { code: string; message?: string }>(
  service: "table" | "route",
  points: LatLng[],
  params: Record<string, string>,
): Promise<T> {
  const url = `${baseUrl()}/${service}/v1/${PROFILE}/${toCoordinates(points)}?${new URLSearchParams(params)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  const data = (await res.json().catch(() => null)) as T | null;
  if (!res.ok || !data || data.code !== "Ok") {
    throw new Error(`OSRM ${service} ${res.status}: ${data?.code ?? ""} ${data?.message ?? ""}`.trim());
  }
  return data;
}

/** Ma trận thời gian/quãng đường di chuyển giữa mọi cặp điểm. */
export async function getRouteMatrix(points: LatLng[]): Promise<RouteMatrix> {
  const data = await request<{
    code: string;
    durations: (number | null)[][];
    distances: (number | null)[][];
  }>("table", points, { annotations: "duration,distance" });
  return { durations: data.durations, distances: data.distances };
}

/** Đường đi qua các điểm theo đúng thứ tự cho trước. */
export async function getRoadRoute(points: LatLng[]): Promise<RoadRoute> {
  const data = await request<{
    code: string;
    routes: {
      distance: number;
      duration: number;
      geometry: { coordinates: [number, number][] };
      legs: { distance: number; duration: number }[];
    }[];
  }>("route", points, { overview: "full", geometries: "geojson", steps: "false" });
  const route = data.routes[0];
  if (!route) throw new Error("OSRM route: không có đường đi.");
  return {
    distanceM: Math.round(route.distance),
    durationS: Math.round(route.duration),
    geometry: route.geometry.coordinates,
    legs: route.legs.map((leg) => ({
      distanceM: Math.round(leg.distance),
      durationS: Math.round(leg.duration),
    })),
  };
}
