// Client tối giản cho SerpApi — engine google_maps (kết quả Google Maps dạng JSON).
// https://serpapi.com/google-maps-api — gói free 250 lượt/tháng: caller PHẢI cache kết quả.

const SERPAPI_URL = "https://serpapi.com/search.json";
const TIMEOUT_MS = 10000;
const MAX_RESULTS = 3;

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
  // true khi Google trả thẳng 1 địa điểm (place_results) — khớp chắc chắn
  exact: boolean;
  places: GooglePlace[];
};

/** SerpApi không dùng được (thiếu key, hết lượt, lỗi mạng/HTTP) — caller nên fallback */
export class SerpApiUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SerpApiUnavailableError";
  }
}

type RawPlace = {
  place_id?: string;
  data_id?: string;
  title?: string;
  type?: string | string[];
  address?: string;
  gps_coordinates?: { latitude?: number; longitude?: number };
  rating?: number;
  reviews?: number;
  thumbnail?: string;
  serpapi_thumbnail?: string;
  phone?: string;
  website?: string;
  // local_results: chuỗi ("Mở cửa ⋅ Đóng cửa lúc 22:00"); place_results: mảng [{ "thứ hai": "05:30–22:00" }, ...]
  hours?: string | Record<string, string>[];
  operating_hours?: Record<string, string>;
};

function formatHours(raw: RawPlace): string | null {
  if (typeof raw.hours === "string") return raw.hours;
  const entries: [string, string][] = Array.isArray(raw.hours)
    ? raw.hours.flatMap((day) => Object.entries(day ?? {}))
    : Object.entries(raw.operating_hours ?? {});
  const valid = entries.filter(([, v]) => typeof v === "string");
  if (valid.length === 0) return null;
  return formatEntries(valid);
}

function formatEntries(entries: [string, string][]): string {
  // Nếu mọi ngày giống nhau thì gộp lại cho gọn
  const unique = new Set(entries.map(([, v]) => v));
  return unique.size === 1
    ? `Hằng ngày: ${entries[0][1]}`
    : entries.map(([day, v]) => `${day}: ${v}`).join("; ");
}

function toPlace(raw: RawPlace): GooglePlace | null {
  const latitude = raw.gps_coordinates?.latitude;
  const longitude = raw.gps_coordinates?.longitude;
  const placeId = raw.place_id ?? raw.data_id;
  if (!placeId || !raw.title || latitude == null || longitude == null) return null;
  return {
    placeId,
    title: raw.title.trim(),
    type: Array.isArray(raw.type) ? (raw.type[0] ?? null) : (raw.type ?? null),
    address: raw.address ?? null,
    latitude,
    longitude,
    rating: raw.rating ?? null,
    reviews: raw.reviews ?? null,
    // serpapi_thumbnail do SerpApi lưu lại, ổn định hơn link googleusercontent
    thumbnail: raw.serpapi_thumbnail ?? raw.thumbnail ?? null,
    phone: raw.phone ?? null,
    website: raw.website ?? null,
    openingHours: formatHours(raw),
  };
}

export async function searchGoogleMaps(q: string): Promise<GoogleMapsSearchResult> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) throw new SerpApiUnavailableError("Thiếu SERPAPI_API_KEY");

  const params = new URLSearchParams({
    engine: "google_maps",
    type: "search",
    q,
    hl: "vi",
    gl: "vn",
    api_key: apiKey,
  });

  let data: {
    error?: string;
    place_results?: RawPlace;
    local_results?: RawPlace[];
  };
  try {
    const res = await fetch(`${SERPAPI_URL}?${params}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    data = await res.json();
    if (!res.ok && !data?.error) {
      throw new SerpApiUnavailableError(`SerpApi trả về HTTP ${res.status}`);
    }
  } catch (error) {
    if (error instanceof SerpApiUnavailableError) throw error;
    throw new SerpApiUnavailableError(`Không gọi được SerpApi: ${String(error)}`);
  }

  if (data.error) {
    // Google không có kết quả: là kết quả rỗng hợp lệ (vẫn cache), không phải lỗi dịch vụ
    if (/hasn't returned any results/i.test(data.error)) {
      return { exact: false, places: [] };
    }
    throw new SerpApiUnavailableError(data.error);
  }

  if (data.place_results) {
    const place = toPlace(data.place_results);
    return { exact: !!place, places: place ? [place] : [] };
  }

  const places = (data.local_results ?? [])
    .map(toPlace)
    .filter((p): p is GooglePlace => p !== null)
    .slice(0, MAX_RESULTS);
  return { exact: false, places };
}
