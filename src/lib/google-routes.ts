// Client tối giản cho Google Routes API — quãng đường/thời gian theo đường đi thực tế.
// https://developers.google.com/maps/documentation/routes

const ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";
const MATRIX_URL = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix";
const TIMEOUT_MS = 15_000;
const CACHE_MAX = 500;

export type TravelMode = "car" | "motorbike" | "walk";
export type Point = { lat: number; lng: number };
export type RouteLeg = { distanceM: number; durationS: number; polyline: string };
/** matrix[i][j] = thời gian (giây) đi từ điểm i tới điểm j; Infinity nếu không có đường. */
export type DurationMatrix = number[][];

const GOOGLE_MODE: Record<TravelMode, string> = {
  car: "DRIVE",
  motorbike: "TWO_WHEELER",
  walk: "WALK",
};

const cache = new Map<string, unknown>();
function remember<T>(key: string, value: T): T {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!);
  cache.set(key, value);
  return value;
}

const pointKey = (p: Point) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
const waypoint = (p: Point) => ({ location: { latLng: { latitude: p.lat, longitude: p.lng } } });
const seconds = (d?: string) => (d ? Number.parseInt(d, 10) : 0);

function apiKey() {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("Thiếu biến môi trường GOOGLE_MAPS_API_KEY.");
  return key;
}

async function post(url: string, fieldMask: string, body: object): Promise<unknown> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey(), "X-Goog-FieldMask": fieldMask },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: { status?: string; message?: string } } | null;
    throw new Error(`Google Routes ${res.status}: ${err?.error?.status ?? ""} ${err?.error?.message ?? ""}`.trim());
  }
  return res.json();
}

// Đi bộ không hỗ trợ routingPreference
const routing = (mode: TravelMode) =>
  mode === "walk" ? {} : { routingPreference: "TRAFFIC_UNAWARE" };

/** Ma trận thời gian di chuyển giữa các điểm (tối đa 25 điểm). */
export async function computeDurationMatrix(points: Point[], mode: TravelMode): Promise<DurationMatrix> {
  const n = points.length;
  const matrix = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)));
  if (n < 2) return matrix;

  const key = `m|${mode}|${points.map(pointKey).join(";")}`;
  if (cache.has(key)) return cache.get(key) as DurationMatrix;

  const waypoints = points.map((p) => ({ waypoint: waypoint(p) }));
  const elements = (await post(MATRIX_URL, "originIndex,destinationIndex,duration,condition", {
    origins: waypoints,
    destinations: waypoints,
    travelMode: GOOGLE_MODE[mode],
    ...routing(mode),
  })) as { originIndex?: number; destinationIndex?: number; duration?: string; condition?: string }[];

  for (const e of elements) {
    const i = e.originIndex ?? 0;
    const j = e.destinationIndex ?? 0;
    if (i !== j && e.condition === "ROUTE_EXISTS") matrix[i][j] = seconds(e.duration);
  }
  return remember(key, matrix);
}

/** Các chặng đi lần lượt qua `points` (tối đa 25 điểm). Điểm trùng liền kề → chặng 0 km; chặng không có đường → null. */
export async function computeLegs(points: Point[], mode: TravelMode): Promise<(RouteLeg | null)[]> {
  if (points.length < 2) return [];

  const key = `r|${mode}|${points.map(pointKey).join(";")}`;
  if (cache.has(key)) return cache.get(key) as (RouteLeg | null)[];

  // Bỏ điểm trùng liền kề (vd: nghỉ ở khách sạn rồi ăn sáng tại khách sạn) vì Google không cho
  const unique: Point[] = [];
  const legIndex: (number | null)[] = []; // chặng thứ i của danh sách gốc ứng với chặng nào của `unique`
  for (const p of points) {
    const last = unique.at(-1);
    if (last && pointKey(last) === pointKey(p)) legIndex.push(null);
    else {
      if (unique.length > 0) legIndex.push(unique.length - 1);
      unique.push(p);
    }
  }

  let legs: (RouteLeg | null)[] = [];
  if (unique.length >= 2) {
    // Một điểm trung gian không tới được bằng xe (sát sông, đường đi bộ...) làm cả tuyến rỗng
    // → tính riêng từng chặng; chặng nào vẫn lỗi thì để null
    legs =
      (await route(unique, mode).catch(() => null)) ??
      (await Promise.all(unique.slice(1).map((p, i) => route([unique[i], p], mode).then((r) => r?.[0] ?? null, () => null))));
    if (legs.every((l) => l == null)) throw new Error("Không tìm được đường đi giữa các điểm.");
  }

  const empty: RouteLeg = { distanceM: 0, durationS: 0, polyline: "" };
  const result = legIndex.map((i) => (i == null ? empty : legs[i]));
  // Chỉ cache khi tính được đủ các chặng
  return result.every((l) => l != null) ? remember(key, result) : result;
}

/** Một tuyến qua các điểm theo thứ tự; null nếu Google không tìm được đường. */
async function route(points: Point[], mode: TravelMode): Promise<RouteLeg[] | null> {
  const data = (await post(ROUTES_URL, "routes.legs.distanceMeters,routes.legs.duration,routes.legs.polyline", {
    origin: waypoint(points[0]),
    destination: waypoint(points.at(-1)!),
    intermediates: points.slice(1, -1).map(waypoint),
    travelMode: GOOGLE_MODE[mode],
    ...routing(mode),
    languageCode: "vi",
    units: "METRIC",
  })) as {
    routes?: { legs?: { distanceMeters?: number; duration?: string; polyline?: { encodedPolyline?: string } }[] }[];
  };
  const legs = data.routes?.[0]?.legs;
  if (!legs || legs.length !== points.length - 1) return null;
  return legs.map((l) => ({
    distanceM: l.distanceMeters ?? 0,
    durationS: seconds(l.duration),
    polyline: l.polyline?.encodedPolyline ?? "",
  }));
}
