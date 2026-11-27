// Client cho Google Maps Places API (New) – Text Search
// https://developers.google.com/maps/documentation/places/web-service/text-search
// Cần GOOGLE_MAPS_API_KEY đã bật "Places API (New)". Tính phí theo request → caller nên cache kết quả.

const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const REQUEST_TIMEOUT_MS = 10000;
const MAX_CONCURRENCY = 4;
const MAX_RESULTS = 5;
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.primaryTypeDisplayName",
  "places.internationalPhoneNumber",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.regularOpeningHours.weekdayDescriptions",
].join(",");

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

type LocalizedText = { text?: string };
type RawPlace = {
  id?: string;
  displayName?: LocalizedText;
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  primaryTypeDisplayName?: LocalizedText;
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
};
type ResponseBody = {
  places?: RawPlace[];
  error?: { code?: number; status?: string; message?: string };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toPlace(raw: RawPlace): GooglePlace | null {
  const placeId = text(raw.id);
  const title = text(raw.displayName?.text);
  const latitude = num(raw.location?.latitude);
  const longitude = num(raw.location?.longitude);
  if (!placeId || !title || latitude == null || longitude == null) return null;

  const hours = raw.regularOpeningHours?.weekdayDescriptions?.filter(Boolean) ?? [];
  return {
    placeId,
    title,
    type: text(raw.primaryTypeDisplayName?.text),
    address: text(raw.formattedAddress),
    latitude,
    longitude,
    rating: num(raw.rating),
    reviews: num(raw.userRatingCount),
    // Ảnh Places cần API key trong URL → không đưa ra client (UI dùng ảnh mặc định)
    thumbnail: null,
    phone: text(raw.internationalPhoneNumber) ?? text(raw.nationalPhoneNumber),
    website: text(raw.websiteUri),
    openingHours: hours.length > 0 ? hours.join("; ") : null,
  };
}

async function searchOne(q: string, apiKey: string, retry = true): Promise<GoogleMapsSearchResult> {
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: q,
        languageCode: "vi",
        regionCode: "VN",
        maxResultCount: MAX_RESULTS,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new GmapsUnavailableError(`Không gọi được Google Places: ${String(error)}`);
  }

  let body: ResponseBody = {};
  try {
    body = (await res.json()) as ResponseBody;
  } catch {
    // body không phải JSON: xử lý theo mã HTTP bên dưới
  }

  // Vượt giới hạn tốc độ: chờ rồi thử lại một lần
  if (res.status === 429 && retry) {
    await sleep(1000);
    return searchOne(q, apiKey, false);
  }

  if (!res.ok) {
    // Ví dụ: PERMISSION_DENIED (chưa bật API / key sai), RESOURCE_EXHAUSTED (hết hạn mức)
    throw new GmapsUnavailableError(
      `Google Places lỗi HTTP ${res.status}: ${body.error?.status ?? "unknown"} ${body.error?.message ?? ""}`.trim(),
    );
  }

  const places = (body.places ?? [])
    .map(toPlace)
    .filter((p): p is GooglePlace => p !== null)
    .slice(0, MAX_RESULTS);
  // Không có kết quả là hợp lệ (vẫn cache), không phải lỗi dịch vụ
  return { exact: places.length === 1, places };
}

/**
 * Tra cứu nhiều truy vấn song song (tối đa MAX_CONCURRENCY cùng lúc).
 * Trả về mảng kết quả cùng thứ tự với `queries`; một truy vấn lỗi thì cả lô lỗi.
 */
export async function searchGoogleMapsBatch(queries: string[]): Promise<GoogleMapsSearchResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new GmapsUnavailableError("Thiếu GOOGLE_MAPS_API_KEY");

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
