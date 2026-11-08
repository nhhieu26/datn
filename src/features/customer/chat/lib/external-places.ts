import type { ExternalPlaceKind } from "@/generated/prisma/client";
import { kindFromTypes, type MapsPlace, searchGoogleMaps, searchGoogleMapsInArea } from "@/lib/google-places";
import { prisma } from "@/lib/prisma";
import { logTiming, timed } from "@/lib/timing";
import { googleMapsUrl, nameSimilarity, num, sameName, stripDiacritics, truncate } from "./format";

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const EMPTY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const RESULTS_PER_LOOKUP = 3;
// Cột osmType của bảng cache dùng để ghi nguồn dữ liệu
const SOURCE = "gmaps";

// Phạm vi hợp lệ của tọa độ: lãnh thổ Việt Nam (kể cả các đảo gần bờ)
const VN_BOUNDS = { minLat: 8, maxLat: 24, minLng: 102, maxLng: 110 };

export type ExternalPlaceResult = {
  source: "external";
  // ExternalPlace.id — dùng để thêm địa điểm vào lộ trình
  id: string;
  kind: ExternalPlaceKind;
  name: string;
  url: string;
  province: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  description: string | null;
  rating: number | null;
  reviewCount: number | null;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
};

type Extra = {
  link?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  phone?: string;
  website?: string;
  openingHours?: string;
};

const normalize = (value: string) =>
  value.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();

function inVietnam(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= VN_BOUNDS.minLat &&
    lat <= VN_BOUNDS.maxLat &&
    lng >= VN_BOUNDS.minLng &&
    lng <= VN_BOUNDS.maxLng
  );
}

type StoredPlace = Awaited<ReturnType<typeof prisma.externalPlace.findMany>>[number];

function toResult(p: StoredPlace, fallbackProvince: string): ExternalPlaceResult {
  const extra = (p.extra ?? {}) as Extra;
  const latitude = num(p.latitude)!;
  const longitude = num(p.longitude)!;
  return {
    source: "external",
    id: p.id,
    kind: p.kind,
    name: p.name,
    url: extra.link ?? googleMapsUrl(latitude, longitude),
    province: p.province ?? fallbackProvince,
    address: p.address,
    latitude,
    longitude,
    type: p.type,
    description: truncate(extra.description, 200),
    rating: extra.rating ?? null,
    reviewCount: extra.reviews ?? null,
    phone: extra.phone ?? null,
    website: extra.website ?? null,
    openingHours: truncate(extra.openingHours, 120),
  };
}

// Còn hoạt động và tọa độ nằm trong Việt Nam
const isUsable = (r: MapsPlace) =>
  Boolean(r.coordinates) && inVietnam(r.coordinates!.latitude, r.coordinates!.longitude) && !r.is_permanently_closed;

// Loại địa điểm: theo mã loại của Google, không rõ thì đoán theo tên loại tiếng Việt
const placeKind = (r: MapsPlace): ExternalPlaceKind => kindFromTypes(r) ?? inferPlaceKind(r.main_category);

// So khớp mờ đạt ngưỡng này thì coi là cùng địa điểm (xem nameSimilarity)
const FUZZY_MATCH_THRESHOLD = 0.75;

type MatchMethod = "trùng tên" | "gần đúng" | "kết quả đầu" | "không có";

const plain = (value: string | null | undefined) => stripDiacritics(value ?? "").toLowerCase();

// Doanh nghiệp quanh một địa điểm (công ty tour, đại lý, chỗ bán vé, ban quản lý...) — không phải chính địa điểm
const BUSINESS_CATEGORY = /\b(nha dieu hanh du lich|dai ly du lich|ban ve|cong ty|van phong|bat dong san|ban quan ly)\b/;
const BUSINESS_NAME = /^(tour|ve|cong ty|van phong)\b|\bban quan ly\b/;
const isBusiness = (r: MapsPlace) => BUSINESS_CATEGORY.test(plain(r.main_category)) || BUSINESS_NAME.test(plain(r.name));

/**
 * Thu hẹp kết quả Google Maps trước khi chọn (giữ thứ tự xếp hạng của Google):
 * 1. Có kết quả nằm đúng khu vực (địa chỉ chứa tên khu vực) → chỉ giữ các kết quả đó, tránh lấy nhầm tỉnh khác
 *    (vd "Hội quán Phúc Kiến" ở Hà Nội khi đang tìm ở Hội An). Không có thì giữ nguyên vì tỉnh có thể đã sáp nhập.
 * 2. Bỏ công ty tour/đại lý/chỗ bán vé/ban quản lý nếu còn kết quả khác; toàn doanh nghiệp thì giữ nguyên.
 */
export function narrowCandidates(usable: MapsPlace[], area: string): MapsPlace[] {
  const areaKey = plain(area);
  const inArea = areaKey && areaKey !== "viet nam" ? usable.filter((r) => plain(r.address).includes(areaKey)) : [];
  const local = inArea.length > 0 ? inArea : usable;
  const places = local.filter((r) => !isBusiness(r));
  return places.length > 0 ? places : local;
}

/**
 * Chọn kết quả Google Maps đúng địa điểm cần tìm, không dùng AI (nhanh, không lo giới hạn quota Gemini):
 * 1. Tên khớp trực tiếp (chứa nhau) → chọn luôn.
 * 2. So khớp mờ đạt ngưỡng (tên thêm/bớt từ, đổi từ loại hình, sai 1 ký tự: "Lăng Minh Mạng" ↔ "Lăng Hoàng đế
 *    Minh Mạng", "Đảo Ti Tốp" ↔ "Hòn Ti Tốp", "Sín Chải" ↔ "Xín Chải") → chọn kết quả giống nhất.
 * 3. Còn lại (tên gọi khác/phiên âm: "Đại Nội" ↔ "Hoàng Thành Huế", "Fansipan" ↔ "Phan Xi Păng") → kết quả đầu
 *    đúng loại; Google Maps tự hiểu tên gọi khác và xếp đúng địa điểm lên đầu.
 * Kết quả đã được thu hẹp trước (đúng khu vực, bỏ công ty tour/chỗ bán vé/ban quản lý — xem narrowCandidates).
 */
function pickMatch(
  results: MapsPlace[],
  { name, kind, area }: { name: string; kind: ExternalPlaceKind; area: string },
): { place: MapsPlace | null; method: MatchMethod } {
  const usable = narrowCandidates(results.filter(isUsable), area);
  if (usable.length === 0) return { place: null, method: "không có" };
  const direct = usable.find((r) => sameName(r.name, name));
  if (direct) return { place: direct, method: "trùng tên" };

  // Giống nhất; bằng điểm thì giữ thứ hạng của Google
  let best: MapsPlace | null = null;
  let bestScore = FUZZY_MATCH_THRESHOLD;
  for (const r of usable) {
    const score = nameSimilarity(name, r.name, area);
    if (score > bestScore || (score === bestScore && !best)) {
      best = r;
      bestScore = score;
    }
  }
  if (best) return { place: best, method: "gần đúng" };

  const top = usable.find((r) => placeKind(r) === kind);
  return top ? { place: top, method: "kết quả đầu" } : { place: null, method: "không có" };
}

async function storePlace(kind: ExternalPlaceKind, place: MapsPlace) {
  const { latitude, longitude } = place.coordinates!;
  const externalId = place.place_id;
  const extra: Extra = Object.fromEntries(
    Object.entries({
      link: place.link,
      rating: place.rating,
      reviews: place.reviews,
      phone: place.phone,
      website: place.website,
      openingHours: place.workday_timing,
    }).filter(([, v]) => v != null && v !== ""),
  );
  const data = {
    kind,
    name: place.name,
    address: place.address ?? "",
    province: place.province,
    latitude,
    longitude,
    category: place.main_category ?? kind,
    type: place.main_category ?? kind,
    extra,
  };
  return prisma.externalPlace.upsert({
    where: { osmType_osmId: { osmType: SOURCE, osmId: externalId } },
    create: { osmType: SOURCE, osmId: externalId, ...data },
    update: data,
    select: { id: true },
  });
}

/**
 * Tra một địa điểm ngoài hệ thống Roamly theo tên trên Google Maps (Google Places API), có cache trong CSDL.
 * Trả về null nếu không tìm thấy địa điểm khớp tên với tọa độ hợp lệ.
 */
export async function lookupExternalPlace({
  kind,
  name,
  province,
}: {
  kind: ExternalPlaceKind;
  name: string;
  province?: string;
}): Promise<ExternalPlaceResult | null> {
  const area = province?.trim() || "Việt Nam";
  const queryKey = [SOURCE, kind, normalize(area), normalize(name)].join("|");

  const lookupStart = performance.now();
  const cached = await prisma.externalPlaceSearch.findUnique({ where: { queryKey } });
  let placeId: string | undefined;

  if (cached && cached.expiresAt > new Date()) {
    placeId = cached.placeIds[0];
    logTiming(`    tra "${name}"`, performance.now() - lookupStart, "cache");
  } else {
    const apiStart = performance.now();
    const results = await searchGoogleMaps({
      query: `${name}, ${area}`,
      limit: RESULTS_PER_LOOKUP,
    });
    const apiMs = performance.now() - apiStart;
    const { place: match, method } = pickMatch(results, { name, kind, area });
    placeId = match ? (await storePlace(kind, match)).id : undefined;
    logTiming(
      `    tra "${name}"`,
      performance.now() - lookupStart,
      `Google ${Math.round(apiMs)}ms, chọn: ${method}${match ? ` → "${match.name}"` : ""}`,
    );

    // Không tìm thấy chỉ cache ngắn hạn
    const expiresAt = new Date(Date.now() + (placeId ? CACHE_TTL_MS : EMPTY_CACHE_TTL_MS));
    const placeIds = placeId ? [placeId] : [];
    await prisma.externalPlaceSearch.upsert({
      where: { queryKey },
      create: { queryKey, placeIds, expiresAt },
      update: { placeIds, expiresAt },
    });
  }

  if (!placeId) return null;
  const row = await prisma.externalPlace.findUnique({ where: { id: placeId } });
  return row ? toResult(row, area) : null;
}

const LIST_SOURCE = "gmaps-list";
const LIST_RESULTS = 5;

// Loại địa điểm theo danh mục chính trên Google Maps
// So theo nguyên từ: tránh "quan" trong "tham quan"/"quảng trường", "lau" trong "lâu đài" bị coi là quán ăn
const HOTEL_CATEGORY =
  /\b(khach san|nha nghi|nghi duong|luu tru|homestay|resort|hotel|motel|hostel|villa|bungalow|lodging|can ho|nha khach|nha tro|guest ?house|inn)\b/;
const RESTAURANT_CATEGORY =
  /\b(nha hang|quan (an|com|nhau|bun|pho|lau|oc|che|nuong|bar)|an uong|restaurant|cafe|ca phe|coffee|tiem banh|banh mi|food|bar|pub|bistro|buffet)\b/;

export function inferPlaceKind(category: string | null | undefined): ExternalPlaceKind {
  const normalized = stripDiacritics(category ?? "").toLowerCase();
  if (HOTEL_CATEGORY.test(normalized)) return "hotel";
  if (RESTAURANT_CATEGORY.test(normalized)) return "restaurant";
  return "destination";
}

/**
 * Tìm nhiều địa điểm trên Google Maps theo từ khóa tự do (ô tìm kiếm của trang lộ trình), có cache trong CSDL.
 * Mỗi lần cache trượt tốn 1 lượt gọi Google Places (tính phí).
 */
export async function searchExternalPlaces({
  query,
  province,
}: {
  query: string;
  province?: string;
}): Promise<ExternalPlaceResult[]> {
  const area = province?.trim() || "";
  const queryKey = [LIST_SOURCE, normalize(area), normalize(query)].join("|");

  const cached = await prisma.externalPlaceSearch.findUnique({ where: { queryKey } });
  let placeIds: string[];

  if (cached && cached.expiresAt > new Date()) {
    placeIds = cached.placeIds;
  } else {
    const results = await searchGoogleMaps({
      query: area ? `${query}, ${area}` : query,
      limit: LIST_RESULTS,
    });
    const valid = results.filter(isUsable);
    placeIds = [];
    for (const place of valid) {
      placeIds.push((await storePlace(placeKind(place), place)).id);
    }
    const expiresAt = new Date(Date.now() + (placeIds.length ? CACHE_TTL_MS : EMPTY_CACHE_TTL_MS));
    await prisma.externalPlaceSearch.upsert({
      where: { queryKey },
      create: { queryKey, placeIds, expiresAt },
      update: { placeIds, expiresAt },
    });
  }

  if (placeIds.length === 0) return [];
  const rows = await prisma.externalPlace.findMany({ where: { id: { in: placeIds } } });
  const byId = new Map(rows.map((row) => [row.id, row]));
  return placeIds
    .map((id) => byId.get(id))
    .filter((row): row is StoredPlace => Boolean(row))
    .map((row) => toResult(row, area || "Việt Nam"));
}

const NEAR_SOURCE = "gmaps-near";
const NEAR_RESULTS = 10;
const NEAR_ZOOM = 14;
const NEAR_RADIUS_KM = 5;
const NEAR_MAX_RADIUS_KM = 10;
const MIN_GOOD_RATING = 3.8;
const MIN_GOOD_REVIEWS = 10;
const REST_STOP = /tram (dung )?(nghi|chan)|dung nghi|rest ?stop/;

/** Khoảng cách đường chim bay giữa hai tọa độ (km). */
export function haversineKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export type NearbyRestaurant = ExternalPlaceResult & { distanceKm: number };

/**
 * Tên/danh mục quán có nhắc đúng món `keyword` không. Từ khóa có dấu so có dấu ("lẩu" không khớp "Cờ Lau"),
 * từ khóa không dấu so theo nguyên từ sau khi bỏ dấu.
 */
export function mentionsFood(place: { name: string; type: string }, keyword: string | undefined): boolean {
  const term = keyword?.trim().normalize("NFC").toLowerCase();
  if (!term) return false;
  const text = `${place.name} ${place.type}`.normalize("NFC").toLowerCase();
  if (term !== stripDiacritics(term)) return text.includes(term);
  return new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(stripDiacritics(text));
}

/**
 * Tìm quán ăn trên Google Maps quanh một vị trí (bữa ăn dọc tuyến đường của lộ trình), có cache trong CSDL.
 * Trả về tối đa `limit` quán xếp hạng theo đánh giá và khoảng cách: ưu tiên quán trong bán kính 5 km
 * (không có thì nới tới 10 km) và quán đánh giá tốt, bỏ qua `excludeIds`.
 */
export async function searchRestaurantCandidatesNear({
  latitude,
  longitude,
  keyword,
  category,
  excludeIds = [],
  limit,
}: {
  latitude: number;
  longitude: number;
  keyword?: string;
  // Loại quán Google Maps tiếng Anh (normalizeFoodCategory), vd "hot pot restaurant" → mã loại "hot_pot_restaurant":
  // chỉ lấy quán Google gắn đúng loại này (chính xác hơn nhưng bỏ sót quán chỉ gắn "Nhà hàng")
  category?: string;
  excludeIds?: string[];
  limit: number;
}): Promise<NearbyRestaurant[]> {
  const term = keyword?.trim() ?? "";
  const queryKey = [
    NEAR_SOURCE,
    `${latitude.toFixed(3)},${longitude.toFixed(3)}`,
    normalize(term),
    ...(category ? [`cat:${category}`] : []),
  ].join("|");
  // Có lọc loại: quán ăn → "nha hang <món>"; quán đồ uống/bánh (không phải "restaurant") → chỉ món hoặc tên loại
  const query = category
    ? category.includes("restaurant") ? `nhà hàng ${term}`.trim() : term || category
    : term ? `nhà hàng ${term}` : "nhà hàng";

  const cached = await prisma.externalPlaceSearch.findUnique({ where: { queryKey } });
  let placeIds: string[];

  if (cached && cached.expiresAt > new Date()) {
    placeIds = cached.placeIds;
    logTiming("    Google quán gần", 0, "cache");
  } else {
    const results = await timed(
      "    Google quán gần (gọi API)",
      () =>
        searchGoogleMaps({
          query,
          limit: NEAR_RESULTS,
          lat: latitude,
          lng: longitude,
          zoom: NEAR_ZOOM,
          ...(category ? { includedType: category.replace(/\s+/g, "_") } : {}),
        }),
      (r) => `${r.length} kết quả`,
    );
    const valid = results.filter(
      (r) =>
        isUsable(r) &&
        (placeKind(r) === "restaurant" || (category != null && r.types.includes(category.replace(/\s+/g, "_")))) &&
        haversineKm({ latitude, longitude }, r.coordinates!) <= NEAR_MAX_RADIUS_KM,
    );
    placeIds = [];
    const storeStart = performance.now();
    for (const place of valid) placeIds.push((await storePlace("restaurant", place)).id);
    logTiming("    lưu quán vào CSDL (tuần tự)", performance.now() - storeStart, `${valid.length} quán`);
    const expiresAt = new Date(Date.now() + (placeIds.length ? CACHE_TTL_MS : EMPTY_CACHE_TTL_MS));
    await prisma.externalPlaceSearch.upsert({
      where: { queryKey },
      create: { queryKey, placeIds, expiresAt },
      update: { placeIds, expiresAt },
    });
  }

  const candidates = placeIds.filter((id) => !excludeIds.includes(id));
  if (candidates.length === 0) return [];
  const rows = await prisma.externalPlace.findMany({ where: { id: { in: candidates } } });
  const places = rows.map((row) => {
    const place = toResult(row, "Việt Nam");
    return { place, distanceKm: haversineKm({ latitude, longitude }, place) };
  });

  const score = ({ place, distanceKm }: (typeof places)[number]) =>
    (place.rating ?? 0) * Math.log10((place.reviewCount ?? 0) + 1) - distanceKm * 0.5;
  // Trạm dừng nghỉ xe khách có rất nhiều đánh giá nhưng không hợp bữa ăn du lịch → chỉ dùng khi không còn quán khác
  const good = ({ place }: (typeof places)[number]) =>
    (place.rating ?? 0) >= MIN_GOOD_RATING &&
    (place.reviewCount ?? 0) >= MIN_GOOD_REVIEWS &&
    !REST_STOP.test(stripDiacritics(place.name).toLowerCase());

  const near = places.filter((p) => p.distanceKm <= NEAR_RADIUS_KM);
  const pool = near.length > 0 ? near : places;
  const ranked = [...(pool.some(good) ? pool.filter(good) : pool)].sort((a, b) => score(b) - score(a));
  // Quán có tên/danh mục chứa đúng món được xếp lên trước
  if (term) ranked.sort((a, b) => Number(mentionsFood(b.place, term)) - Number(mentionsFood(a.place, term)));
  return ranked
    .slice(0, limit)
    .map(({ place, distanceKm }) => ({ ...place, distanceKm: Math.round(distanceKm * 10) / 10 }));
}

const HOTEL_LIST_SOURCE = "gmaps-hotels";
const HOTEL_AREA_SOURCE = "gmaps-area";
const HOTEL_RESULTS = 20;
// Mã loại lưu trú của Google: ưu tiên chỗ ở, đẩy nhà hàng, công ty tour, chỗ bán vé... xuống
const HOTEL_TYPE = "lodging";
// Tìm có lọc loại ra ít hơn mức này thì bổ sung bằng tìm không lọc (khách sạn chỉ gắn loại lạ vẫn có cơ hội)
const MIN_FILTERED_HOTELS = 3;

/** Xếp khách sạn theo đánh giá; ưu tiên khách sạn từ 3.8 sao và có từ 10 đánh giá. */
export function rankHotels(places: ExternalPlaceResult[]): ExternalPlaceResult[] {
  const score = (p: ExternalPlaceResult) => (p.rating ?? 0) * Math.log10((p.reviewCount ?? 0) + 1);
  const good = (p: ExternalPlaceResult) => (p.rating ?? 0) >= MIN_GOOD_RATING && (p.reviewCount ?? 0) >= MIN_GOOD_REVIEWS;
  const pool = places.some(good) ? places.filter(good) : places;
  return [...pool].sort((a, b) => score(b) - score(a));
}

// Số lệnh ghi CSDL chạy cùng lúc: đủ nhanh (~4 lệnh/100ms) mà không mở dồn nhiều kết nối mới tới Neon pooler
const STORE_CONCURRENCY = 4;

/** Như Promise.all(items.map(fn)) nhưng chỉ chạy tối đa `limit` việc cùng lúc; giữ đúng thứ tự kết quả. */
async function mapWithLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// Tìm khách sạn qua Google Places (hoặc cache), lưu vào CSDL, trả về danh sách đã xếp hạng.
async function cachedHotelSearch(
  queryKey: string,
  label: string,
  search: () => Promise<MapsPlace[]>,
  narrow: (results: MapsPlace[]) => MapsPlace[],
  area: string,
): Promise<ExternalPlaceResult[]> {
  const cached = await prisma.externalPlaceSearch.findUnique({ where: { queryKey } });
  let placeIds: string[];

  if (cached && cached.expiresAt > new Date()) {
    placeIds = cached.placeIds;
    logTiming(label, 0, "cache");
  } else {
    const results = await timed(label, search, (r) => `${r.length} kết quả`);
    // Khử trùng trước khi lưu song song (2 upsert cùng địa điểm chạy đồng thời có thể lỗi trùng khóa)
    const seen = new Set<string>();
    const hotels = narrow(results.filter(isUsable)).filter((r) => {
      const key = r.place_id;
      if (placeKind(r) !== "hotel" || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    placeIds = (await mapWithLimit(hotels, STORE_CONCURRENCY, (place) => storePlace("hotel", place))).map((row) => row.id);
    const expiresAt = new Date(Date.now() + (placeIds.length ? CACHE_TTL_MS : EMPTY_CACHE_TTL_MS));
    await prisma.externalPlaceSearch.upsert({
      where: { queryKey },
      create: { queryKey, placeIds, expiresAt },
      update: { placeIds, expiresAt },
    });
  }

  if (placeIds.length === 0) return [];
  const rows = await prisma.externalPlace.findMany({ where: { id: { in: placeIds } } });
  return rankHotels(rows.map((row) => toResult(row, area)));
}

/**
 * Khách sạn trên Google Maps theo tên điểm đến ("khách sạn <tỉnh>"), đã xếp hạng.
 * Không cần tọa độ nên chạy song song ngay từ đầu. Có thể lẫn khách sạn ở nơi khác (vd "khach san, Ha Giang" từng ra
 * đúng 1 khách sạn tên "Hà Giang Hotel" ở Quảng Ninh) → nơi gọi nên kiểm tra khoảng cách tới các điểm tham quan.
 */
export async function searchHotelsInProvince(province: string): Promise<ExternalPlaceResult[]> {
  const area = province.trim();
  // "khách sạn <tỉnh>" thường bị hiểu là tên một khách sạn (chỉ ra 1 kết quả) → thêm "ở"
  const query = `khách sạn ở ${area}`;
  const narrow = (results: MapsPlace[]) => narrowCandidates(results, area);
  const typed = await cachedHotelSearch(
    [HOTEL_LIST_SOURCE, "typed", normalize(query)].join("|"),
    "    Google khách sạn theo tỉnh (ưu tiên loại lưu trú)",
    () => searchGoogleMaps({ query, limit: HOTEL_RESULTS, includedType: HOTEL_TYPE }),
    narrow,
    area,
  );
  if (typed.length >= MIN_FILTERED_HOTELS) return typed;
  const loose = await cachedHotelSearch(
    [HOTEL_LIST_SOURCE, normalize(query)].join("|"),
    "    Google khách sạn theo tỉnh (không lọc)",
    () => searchGoogleMaps({ query, limit: HOTEL_RESULTS }),
    narrow,
    area,
  );
  return mergeHotels(typed, loose);
}

const mergeHotels = (a: ExternalPlaceResult[], b: ExternalPlaceResult[]) =>
  rankHotels([...a, ...b.filter((h) => !a.some((x) => x.id === h.id))]);

/**
 * Khách sạn trong khung nhìn bản đồ quanh một tọa độ (zoom 13 ≈ 18×18 km), đã xếp hạng.
 * Dùng khi tìm theo tên tỉnh ra ít hoặc ra khách sạn ở xa các điểm tham quan.
 */
export async function searchHotelsInArea({
  latitude,
  longitude,
  zoom = 13,
}: {
  latitude: number;
  longitude: number;
  zoom?: number;
}): Promise<ExternalPlaceResult[]> {
  const point = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  const typed = await cachedHotelSearch(
    [HOTEL_AREA_SOURCE, "hotel-typed", point, zoom].join("|"),
    `    Google khách sạn trong khu vực (zoom ${zoom}, ưu tiên loại lưu trú)`,
    () => searchGoogleMapsInArea({ query: "hotel", lat: latitude, lng: longitude, zoom, limit: HOTEL_RESULTS, includedType: HOTEL_TYPE }),
    (results) => results,
    "Việt Nam",
  );
  if (typed.length >= MIN_FILTERED_HOTELS) return typed;
  const loose = await cachedHotelSearch(
    [HOTEL_AREA_SOURCE, "hotel", point, zoom].join("|"),
    `    Google khách sạn trong khu vực (zoom ${zoom}, không lọc)`,
    () => searchGoogleMapsInArea({ query: "khách sạn", lat: latitude, lng: longitude, zoom, limit: HOTEL_RESULTS }),
    (results) => results,
    "Việt Nam",
  );
  return mergeHotels(typed, loose);
}

/** Đọc một địa điểm Google Maps đã lưu trong CSDL. */
export async function getExternalPlaceById(id: string): Promise<ExternalPlaceResult | null> {
  const row = await prisma.externalPlace.findUnique({ where: { id } });
  return row ? toResult(row, "Việt Nam") : null;
}
