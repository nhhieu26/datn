// Client tối giản cho Nominatim (OpenStreetMap) — tuân thủ usage policy:
// có User-Agent định danh ứng dụng và tối đa 1 request/giây.
// https://operations.osmfoundation.org/policies/nominatim/

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const MIN_INTERVAL_MS = 1100;
const TIMEOUT_MS = 8000;

export type NominatimPlace = {
  osm_type: "node" | "way" | "relation";
  osm_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  category: string;
  type: string;
  importance?: number;
  address?: Record<string, string>;
  extratags?: Record<string, string> | null;
  namedetails?: Record<string, string> | null;
};

// Hàng đợi tuần tự trong process: đảm bảo khoảng cách giữa 2 request liên tiếp
let queue: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

function throttled<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequestAt = Date.now();
    return task();
  });
  queue = run.catch(() => undefined);
  return run;
}

export function searchNominatim({
  q,
  limit = 10,
}: {
  q: string;
  limit?: number;
}): Promise<NominatimPlace[]> {
  const params = new URLSearchParams({
    q,
    format: "jsonv2",
    countrycodes: "vn",
    addressdetails: "1",
    extratags: "1",
    namedetails: "1",
    "accept-language": "vi",
    limit: String(limit),
  });

  return throttled(async () => {
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        "User-Agent": `Roamly-DATN/1.0 (${process.env.APP_URL ?? "http://localhost:2612"})`,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`Nominatim trả về HTTP ${res.status}`);
    }
    return (await res.json()) as NominatimPlace[];
  });
}
