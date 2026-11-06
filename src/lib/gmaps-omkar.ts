// Client cho Omkar Cloud Google Maps Scraper API (https://www.omkar.cloud/tools/google-maps-scraper)
// — định vị địa điểm trên Google Maps. API đồng bộ, mỗi truy vấn ~0,5–4 s.
// Giới hạn: 5 request/giây/key (HTTP 429 rate_limited), gói free 1.000 request/tháng → caller PHẢI cache kết quả.

const ENDPOINT = "https://google-maps-scraper.omkar.cloud/search";
const REQUEST_TIMEOUT_MS = 20000;
// Dưới ngưỡng 5 request/giây của Omkar: vừa giới hạn đồng thời, vừa giãn cách thời điểm bắt đầu request
const MAX_CONCURRENCY = 4;
const MIN_START_INTERVAL_MS = 230;
const MAX_RESULTS = 5;
// Chờ tối đa bấy nhiêu giây khi bị giới hạn tốc độ (HTTP 429 rate_limited) trước khi thử lại một lần
const MAX_RATE_LIMIT_WAIT_S = 5;

export type GooglePlace = {
  placeId: string;
  title: string;
  type: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  rating: number | null;
  reviews: number | null;
  thumbnail: string | null;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
};

export type GoogleMapsSearchResult = {
  // true khi chỉ có đúng 1 địa điểm — khớp chắc chắn
  exact: boolean;
  places: GooglePlace[];
};

/** Dịch vụ không dùng được (thiếu key, hết hạn mức, lỗi mạng/HTTP) */
export class GmapsUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GmapsUnavailableError";
  }
}

type RawPlace = Record<string, unknown>;
type ErrorBody = { code?: string; message?: string; retry_after_seconds?: number };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Cấp "suất" bắt đầu request cách nhau tối thiểu MIN_START_INTERVAL_MS (dùng chung toàn process)
let nextSlotAt = 0;
async function waitForSlot(): Promise<void> {
  const now = Date.now();
  const slot = Math.max(now, nextSlotAt);
  nextSlotAt = slot + MIN_START_INTERVAL_MS;
  if (slot > now) await sleep(slot - now);
}

function parseNumber(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

/** Website đôi khi không có giao thức ("www.example.com/...") */
function normalizeWebsite(value: unknown): string | null {
  const site = text(value);
  if (!site) return null;
  return /^https?:\/\//i.test(site) ? site : `https://${site}`;
}

/** `workday_timing` là chuỗi sẵn; không có thì gộp từ `hours`: [{ day, times: [...] }] */
function openingHours(raw: RawPlace): string | null {
  const timing = text(raw["workday_timing"]);
  if (timing) return timing;

  const hours = raw["hours"];
  if (!Array.isArray(hours)) return null;
  const parts = hours
    .map((h) => {
      const entry = h as { day?: unknown; times?: unknown };
      const times = Array.isArray(entry.times)
        ? entry.times.filter((t): t is string => typeof t === "string").join(", ")
        : "";
      return text(entry.day) && times ? `${entry.day}: ${times}` : null;
    })
    .filter((p): p is string => p !== null);
  return parts.length > 0 ? parts.join("; ") : null;
}

function toPlace(raw: RawPlace): GooglePlace | null {
  const placeId = text(raw["place_id"]);
  const title = text(raw["name"]);
  const coordinates = (raw["coordinates"] ?? {}) as { latitude?: unknown; longitude?: unknown };
  const latitude = parseNumber(coordinates.latitude);
  const longitude = parseNumber(coordinates.longitude);
  if (!placeId || !title || latitude == null || longitude == null) return null;

  return {
    placeId,
    title,
    type: text(raw["main_category"]),
    address: text(raw["address"]),
    latitude,
    longitude,
    rating: parseNumber(raw["rating"]),
    reviews: parseNumber(raw["reviews"]),
    // Kết quả search của Omkar không có ảnh (UI dùng ảnh mặc định)
    thumbnail: null,
    phone: text(raw["phone_international"]) ?? text(raw["phone"]),
    website: normalizeWebsite(raw["website"]),
    openingHours: openingHours(raw),
  };
}

async function searchOne(q: string, apiKey: string, retry = true): Promise<GoogleMapsSearchResult> {
  const params = new URLSearchParams({
    query: q,
    limit: String(MAX_RESULTS),
    language: "vi",
    country_code: "vn",
  });

  await waitForSlot();
  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}?${params}`, {
      headers: { "API-Key": apiKey },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new GmapsUnavailableError(`Không gọi được Omkar: ${String(error)}`);
  }

  let body: { results?: RawPlace[] } & ErrorBody = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    // body không phải JSON: xử lý theo mã HTTP bên dưới
  }

  // 429 rate_limited (khác quota_exceeded): chờ rồi thử lại một lần
  if (res.status === 429 && body.code === "rate_limited" && retry) {
    const wait = Math.min(
      Number(res.headers.get("retry-after")) || body.retry_after_seconds || 1,
      MAX_RATE_LIMIT_WAIT_S,
    );
    await sleep(wait * 1000);
    return searchOne(q, apiKey, false);
  }

  if (!res.ok) {
    // Ví dụ: quota_exceeded, invalid_api_key, subscription_expired, upstream_unavailable
    throw new GmapsUnavailableError(
      `Omkar lỗi HTTP ${res.status}: ${body.code ?? "unknown"} ${body.message ?? ""}`.trim(),
    );
  }

  const places = (body.results ?? [])
    .map(toPlace)
    .filter((p): p is GooglePlace => p !== null)
    .slice(0, MAX_RESULTS);
  // Không có dòng nào là kết quả rỗng hợp lệ (vẫn cache), không phải lỗi dịch vụ
  return { exact: places.length === 1, places };
}

/**
 * Tra cứu nhiều truy vấn song song (tối đa MAX_CONCURRENCY cùng lúc).
 * Trả về mảng kết quả cùng thứ tự với `queries`; một truy vấn lỗi thì cả lô lỗi.
 */
export async function searchGoogleMapsBatch(queries: string[]): Promise<GoogleMapsSearchResult[]> {
  const apiKey = process.env.OMKAR_API_KEY;
  if (!apiKey) throw new GmapsUnavailableError("Thiếu OMKAR_API_KEY");

  const results: GoogleMapsSearchResult[] = new Array(queries.length);
  let next = 0;
  const worker = async () => {
    while (next < queries.length) {
      const idx = next++;
      results[idx] = await searchOne(queries[idx], apiKey);
    }
  };
  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENCY, queries.length) }, worker));
  return results;
}
