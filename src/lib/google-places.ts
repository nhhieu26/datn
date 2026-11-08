// Client tối giản cho Google Places API (New) — Text Search.
// https://developers.google.com/maps/documentation/places/web-service/text-search
// Xử lý song song thật (đo 08/11/2026: 20 request cùng lúc ≈ 0.5s), quota mặc định 600 request/phút.

const BASE_URL = "https://places.googleapis.com/v1/places:searchText";
// Thường trả về trong 0.3–0.6s; thỉnh thoảng một request treo → hủy sớm rồi gửi lại
const TIMEOUT_MS = 6_000;
const RATE_LIMITED_RETRY_MS = 1000;
// Giữ dưới quota 600 request/phút khi nhiều người dùng tìm cùng lúc
const MAX_IN_FLIGHT = 10;
const MAX_PAGE_SIZE = 20;
// zoom 13 ≈ khung 18×18 km ở vĩ độ Việt Nam (mỗi mức zoom gấp đôi/giảm nửa)
const HALF_SIZE_KM_AT_ZOOM_13 = 9;
const KM_PER_DEG_LAT = 111;

// Chỉ lấy trường cần dùng: field mask quyết định đơn giá (đang ở SKU Text Search Enterprise)
const FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "addressComponents",
  "location",
  "primaryType",
  "primaryTypeDisplayName",
  "types",
  "rating",
  "userRatingCount",
  "nationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "businessStatus",
  "regularOpeningHours.weekdayDescriptions",
]
  .map((field) => `places.${field}`)
  .join(",");

export type MapsPlace = {
  place_id: string;
  name: string;
  address: string | null;
  // Tỉnh/thành (administrative_area_level_1)
  province: string | null;
  coordinates: { latitude: number; longitude: number } | null;
  // Tên loại chính bằng tiếng Việt, vd "Khách sạn", "Nhà hàng Việt Nam", "Điểm thu hút khách du lịch"
  main_category: string | null;
  primary_type: string | null;
  // Mã loại của Google, vd ["resort_hotel", "lodging", ...]
  types: string[];
  rating: number | null;
  reviews: number | null;
  phone: string | null;
  website: string | null;
  workday_timing: string | null;
  link: string | null;
  is_permanently_closed: boolean;
};

type ApiPlace = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  addressComponents?: { longText?: string; types?: string[] }[];
  location?: { latitude: number; longitude: number };
  primaryType?: string;
  primaryTypeDisplayName?: { text: string };
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  businessStatus?: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";
  regularOpeningHours?: { weekdayDescriptions?: string[] };
};

let inFlight = 0;
const waiters: (() => void)[] = [];

async function acquire(): Promise<() => void> {
  if (inFlight >= MAX_IN_FLIGHT) await new Promise<void>((resolve) => waiters.push(resolve));
  else inFlight++;
  return () => {
    const next = waiters.shift();
    if (next) next();
    else inFlight--;
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function toMapsPlace(p: ApiPlace): MapsPlace {
  return {
    place_id: p.id,
    name: p.displayName?.text ?? "",
    address: p.formattedAddress ?? null,
    province: p.addressComponents?.find((c) => c.types?.includes("administrative_area_level_1"))?.longText ?? null,
    coordinates: p.location ?? null,
    main_category: p.primaryTypeDisplayName?.text ?? p.primaryType ?? null,
    primary_type: p.primaryType ?? null,
    types: p.types ?? [],
    rating: p.rating ?? null,
    reviews: p.userRatingCount ?? null,
    phone: p.nationalPhoneNumber ?? null,
    website: p.websiteUri ?? null,
    workday_timing: p.regularOpeningHours?.weekdayDescriptions?.join("; ") ?? null,
    link: p.googleMapsUri ?? null,
    is_permanently_closed: p.businessStatus === "CLOSED_PERMANENTLY",
  };
}

async function searchText(body: Record<string, unknown>): Promise<MapsPlace[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Thiếu biến môi trường GOOGLE_MAPS_API_KEY.");

  const send = () =>
    fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": FIELD_MASK },
      body: JSON.stringify({ languageCode: "vi", regionCode: "VN", ...body }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

  const release = await acquire();
  try {
    let res = await send().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "TimeoutError") return send();
      throw error;
    });
    if (res.status === 429) {
      await sleep(RATE_LIMITED_RETRY_MS);
      res = await send();
    }
    if (!res.ok) {
      const error = (await res.json().catch(() => null)) as { error?: { status?: string; message?: string } } | null;
      throw new Error(`Google Places ${res.status}: ${error?.error?.status ?? ""} ${error?.error?.message ?? ""}`.trim());
    }
    const data = (await res.json()) as { places?: ApiPlace[] };
    return (data.places ?? []).map(toMapsPlace);
  } finally {
    release();
  }
}

const halfSizeKm = (zoom: number) => HALF_SIZE_KM_AT_ZOOM_13 * 2 ** (13 - zoom);

/**
 * Tìm theo từ khóa; `lat`/`lng`/`zoom` chỉ ưu tiên kết quả gần (locationBias), KHÔNG giới hạn khu vực.
 * `includedType`: ưu tiên địa điểm có loại này (mã loại Google, vd "lodging", "hot_pot_restaurant"). Không bật
 * strictTypeFiltering: đo 09/11/2026 "khách sạn ở Đà Lạt" lọc chặt chỉ ra 1–6 kết quả, không chặt ra 15 → nơi gọi tự lọc
 * lại theo `types`. Loại không hợp lệ bị Google trả lỗi 400 → tự tìm lại không có loại.
 */
export async function searchGoogleMaps({
  query,
  limit = 3,
  lat,
  lng,
  zoom,
  includedType,
}: {
  query: string;
  limit?: number;
  lat?: number;
  lng?: number;
  zoom?: number;
  includedType?: string;
}): Promise<MapsPlace[]> {
  const body: Record<string, unknown> = { textQuery: query, pageSize: Math.min(limit, MAX_PAGE_SIZE) };
  if (lat != null && lng != null) {
    const radius = Math.min(50_000, halfSizeKm(zoom ?? 13) * 1000);
    body.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius } };
  }
  if (!includedType) return searchText(body);
  try {
    return await searchText({ ...body, includedType });
  } catch (error) {
    if (!String(error).includes("Google Places 400")) throw error;
    return searchText(body);
  }
}

/**
 * Tìm trong khung bản đồ: chỉ trả về địa điểm nằm trong khung vuông quanh (`lat`, `lng`) ở mức `zoom`
 * (zoom 13 ≈ 18×18 km, zoom 12 ≈ 36×36 km). Bỏ địa điểm đã đóng cửa vĩnh viễn.
 */
export async function searchGoogleMapsInArea({
  query,
  lat,
  lng,
  zoom,
  limit = 20,
  includedType,
}: {
  query: string;
  lat: number;
  lng: number;
  zoom: number;
  limit?: number;
  includedType?: string;
}): Promise<MapsPlace[]> {
  const half = halfSizeKm(zoom);
  const dLat = half / KM_PER_DEG_LAT;
  const dLng = half / (KM_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180));
  const results = await searchText({
    textQuery: query,
    pageSize: Math.min(limit, MAX_PAGE_SIZE),
    locationRestriction: {
      rectangle: {
        low: { latitude: lat - dLat, longitude: lng - dLng },
        high: { latitude: lat + dLat, longitude: lng + dLng },
      },
    },
    ...(includedType ? { includedType } : {}),
  });
  return results.filter((r) => !r.is_permanently_closed);
}

const LODGING_TYPES = new Set(["lodging", "hotel", "resort_hotel", "motel", "hostel", "guest_house", "bed_and_breakfast", "inn", "farmstay", "cottage", "private_guest_room", "budget_japanese_inn", "campground", "extended_stay_hotel", "japanese_inn"]);
const FOOD_TYPES = /(^|_)(restaurant|cafe|coffee_shop|bakery|bar|pub|food_court|meal_takeaway|diner|bistro|tea_house|ice_cream_shop|dessert_shop|juice_shop|food|noodle_shop|beer_garden|brewpub|wine_bar)$/;

/** Loại địa điểm theo mã loại của Google; null nếu không xác định (để nơi gọi đoán theo tên loại). */
export function kindFromTypes(place: Pick<MapsPlace, "primary_type" | "types">): "hotel" | "restaurant" | "destination" | null {
  const primary = place.primary_type;
  if (primary) {
    if (LODGING_TYPES.has(primary)) return "hotel";
    if (FOOD_TYPES.test(primary)) return "restaurant";
    if (primary === "tourist_attraction") return "destination";
  }
  if (place.types.includes("lodging")) return "hotel";
  if (place.types.includes("restaurant") || place.types.includes("food")) return "restaurant";
  return null;
}
