import { type ExternalPlace, type ExternalPlaceKind, Prisma } from "@/generated/prisma/client";
import { type GooglePlace, type LatLng, searchPlacesText, type Viewport } from "@/lib/google-maps";
import { prisma } from "@/lib/prisma";

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SOURCE = "gplaces";
const PAGE_SIZE = 8;
// Khung tìm kiếm tối thiểu: Google trả viewport rất nhỏ cho phường (~vài km) và gần như 0 cho đảo/thắng cảnh.
// Không nới quá rộng vì ở thành phố lớn 10km đã lan sang nhiều quận khác.
const MIN_SPAN_DEG = 0.04; // ~4.5km
const MIN_SPAN_NATURAL_DEG = 0.1; // ~11km cho đảo, vịnh, núi
const NATURAL_TYPES = ["natural_feature", "island", "archipelago"];
// Tỉnh cũ đã sáp nhập (07/2025): Google hiểu tên này là phường/xã trung tâm tỉnh cũ (vd "Hải Dương" →
// phường Hải Dương, Hải Phòng, khung ~4km), trong khi người dùng nói cả tỉnh. Điểm tham quan của tỉnh cũ
// nằm rải rác ở các huyện (chùa Côn Sơn, đền Kiếp Bạc cách ~20km) nên phải mở rộng khung tìm.
const FORMER_PROVINCES = new Set(
  [
    "Hà Giang", "Yên Bái", "Bắc Kạn", "Vĩnh Phúc", "Hòa Bình", "Bắc Giang", "Thái Bình", "Hải Dương",
    "Hà Nam", "Nam Định", "Quảng Bình", "Quảng Nam", "Kon Tum", "Bình Định", "Ninh Thuận", "Đắk Nông",
    "Bình Thuận", "Phú Yên", "Bình Dương", "Bà Rịa - Vũng Tàu", "Bình Phước", "Long An", "Sóc Trăng",
    "Hậu Giang", "Bến Tre", "Trà Vinh", "Tiền Giang", "Bạc Liêu", "Kiên Giang",
  ].map((s) => s.normalize("NFC").toLowerCase()),
);
const MIN_SPAN_FORMER_PROVINCE_DEG = 0.45; // ~50km
const isFormerProvince = (location: string) =>
  FORMER_PROVINCES.has(location.split(",")[0].normalize("NFC").toLowerCase().replace(/^tỉnh\s+/, "").trim());

const GOOGLE_TYPE: Record<ExternalPlaceKind, string> = {
  hotel: "lodging",
  restaurant: "restaurant",
  destination: "tourist_attraction",
};

// Điểm tham quan không lọc theo loại vì nhiều chùa/đền trên Google chỉ là "place_of_worship";
// thay vào đó loại quán ăn/chỗ ở và xếp theo số đánh giá để nơi nổi tiếng lên đầu.
const DESTINATION_POOL_SIZE = 20;
const NOT_DESTINATION_TYPES = ["restaurant", "cafe", "bar", "food", "lodging", "store"];
const isDestination = (p: GooglePlace) =>
  p.types?.includes("tourist_attraction") || !p.types?.some((t) => NOT_DESTINATION_TYPES.includes(t));

export type Place = {
  id: string;
  /** Place ID của Google (null với dữ liệu cũ không lấy từ Google Places). */
  googlePlaceId: string | null;
  kind: ExternalPlaceKind;
  name: string;
  url: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
  rating: number | null;
  reviewCount: number | null;
  openingHours: string | null;
  image: string | null;
};

export type PlaceSearchResult =
  | { status: "ok"; area: string; places: Place[] }
  | { status: "ambiguous"; options: string[] }
  | { status: "not_found" };

type Extra = {
  url?: string;
  rating?: number;
  reviewCount?: number;
  openingHours?: string;
  photo?: string;
};

const norm = (s: string) => s.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();

function toPlace(row: ExternalPlace): Place {
  const extra = row.extra as Extra;
  const lat = Number(row.latitude);
  const lng = Number(row.longitude);
  // places/{placeId}/photos/{photoId} -> /api/place-photo/{placeId}/{photoId}
  const photo = extra.photo?.match(/^places\/([^/]+)\/photos\/([^/]+)$/);
  return {
    id: row.id,
    googlePlaceId: row.osmType === SOURCE ? row.osmId : null,
    kind: row.kind,
    name: row.name,
    url: extra.url ?? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    address: row.address,
    lat,
    lng,
    type: row.type,
    rating: extra.rating ?? null,
    reviewCount: extra.reviewCount ?? null,
    openingHours: extra.openingHours ?? null,
    image: photo ? `/api/place-photo/${photo[1]}/${photo[2]}` : null,
  };
}

function saveGooglePlace(kind: ExternalPlaceKind, p: GooglePlace) {
  const data = {
    kind,
    name: p.displayName!.text,
    address: p.formattedAddress ?? "",
    latitude: p.location!.latitude,
    longitude: p.location!.longitude,
    category: GOOGLE_TYPE[kind],
    type: p.primaryTypeDisplayName?.text ?? GOOGLE_TYPE[kind],
    extra: {
      url: p.googleMapsUri,
      rating: p.rating,
      reviewCount: p.userRatingCount,
      openingHours: p.regularOpeningHours?.weekdayDescriptions?.join("; "),
      photo: p.photos?.[0]?.name,
    } satisfies Extra,
  };
  return prisma.externalPlace.upsert({
    where: { osmType_osmId: { osmType: SOURCE, osmId: p.id } },
    create: { osmType: SOURCE, osmId: p.id, ...data },
    update: data,
  });
}

/** Đọc các địa điểm đã lưu theo id; id không tồn tại sẽ không có trong Map. */
export async function getPlacesByIds(ids: string[]): Promise<Map<string, Place>> {
  const rows = await prisma.externalPlace.findMany({ where: { id: { in: [...new Set(ids)] } } });
  return new Map(rows.map((r) => [r.id, toPlace(r)]));
}

// ---------- Xác định khu vực ----------

const provinceOf = (p: GooglePlace) =>
  p.addressComponents?.find((c) => c.types?.includes("administrative_area_level_1"))?.longText ?? "";

const area = (v: Viewport) => (v.high.latitude - v.low.latitude) * (v.high.longitude - v.low.longitude);

function expand(v: Viewport, minSpan: number): Viewport {
  const grow = (low: number, high: number) => {
    const mid = (low + high) / 2;
    const half = Math.max(high - low, minSpan) / 2;
    return [mid - half, mid + half];
  };
  const [lowLat, highLat] = grow(v.low.latitude, v.high.latitude);
  const [lowLng, highLng] = grow(v.low.longitude, v.high.longitude);
  return { low: { latitude: lowLat, longitude: lowLng }, high: { latitude: highLat, longitude: highLng } };
}

const inside = (p: LatLng, v: Viewport) =>
  p.latitude >= v.low.latitude &&
  p.latitude <= v.high.latitude &&
  p.longitude >= v.low.longitude &&
  p.longitude <= v.high.longitude;

/** Các địa danh (không phải quán/cửa hàng) có tên chứa `name`. */
async function findAreas(query: string, name: string) {
  const results = await searchPlacesText({ textQuery: query, pageSize: 10 });
  return results.filter(
    (p) =>
      p.viewport &&
      !p.types?.includes("point_of_interest") &&
      norm(p.displayName?.text ?? "").includes(norm(name)),
  );
}

type Area = { label: string; viewport: Viewport };
type AreaResult = Area | { ambiguous: string[] } | null;

const AREA_TTL_MS = 30 * 24 * 60 * 60 * 1000;
// Tên trùng/không tìm thấy chỉ cache ngắn để sớm tìm lại khi dữ liệu Google thay đổi
const AREA_MISS_TTL_MS = 24 * 60 * 60 * 1000;
const areaKey = (location: string) => `v1|${norm(location)}`;

/** Khu vực đã cache còn hạn; null nếu chưa có hoặc đã hết hạn. */
async function cachedArea(location: string): Promise<{ result: AreaResult } | null> {
  const row = await prisma.externalArea.findUnique({ where: { queryKey: areaKey(location) } });
  return row && row.expiresAt > new Date() ? { result: row.result as AreaResult } : null;
}

async function resolveArea(location: string): Promise<AreaResult> {
  const cached = await cachedArea(location);
  if (cached) return cached.result;

  const result = await fetchArea(location);
  const queryKey = areaKey(location);
  const expiresAt = new Date(Date.now() + (result && "label" in result ? AREA_TTL_MS : AREA_MISS_TTL_MS));
  const data = { result: result ?? Prisma.DbNull, expiresAt };
  await prisma.externalArea.upsert({ where: { queryKey }, create: { queryKey, ...data }, update: data });
  return result;
}

/**
 * "Chí Linh" → khu vực trên bản đồ. Tên trùng ở nhiều tỉnh → trả danh sách để hỏi lại.
 * Không so tên tỉnh dạng chữ vì tỉnh đã sáp nhập (Hải Dương cũ nay là Hải Phòng): tỉnh hợp lệ
 * là tỉnh mà Google trả về khi tìm cả cụm người dùng nhập.
 */
async function fetchArea(location: string): Promise<AreaResult> {
  const name = location.split(",")[0].trim();
  const hasHint = location.includes(",");

  const [byName, byFull] = await Promise.all([
    findAreas(name, name),
    hasHint ? findAreas(location, name) : Promise.resolve([]),
  ]);

  let candidates = [...byName, ...byFull];
  if (hasHint && byFull.length > 0) {
    const provinces = new Set(byFull.map(provinceOf));
    candidates = candidates.filter((p) => provinces.has(provinceOf(p)));
  }
  if (candidates.length === 0) return null;

  const provinces = [...new Set(candidates.map(provinceOf))];
  if (provinces.length > 1) return { ambiguous: provinces.slice(0, 4).map((pr) => `${name}, ${pr}`) };

  // Cùng một tỉnh: chọn khu vực rộng nhất (vd thành phố Chí Linh thay vì khu phố Chí Linh)
  const best = candidates.reduce((a, b) => (area(b.viewport!) > area(a.viewport!) ? b : a));
  const natural = best.types?.some((t) => NATURAL_TYPES.includes(t));
  return {
    label: best.formattedAddress ?? location,
    viewport: expand(best.viewport!, natural ? MIN_SPAN_NATURAL_DEG : MIN_SPAN_DEG),
  };
}

// ---------- Tìm địa điểm ----------

// Tra theo tên riêng: nơi nổi tiếng của một địa danh thường ở huyện lân cận (vd chùa Côn Sơn cách
// TP Hải Dương ~30km), nên không khóa trong khung khu vực mà chỉ giới hạn bán kính.
const NAME_LOOKUP_RADIUS_KM = 50;
const MIN_NAME_OVERLAP = 0.5;

const tokens = (s: string) => norm(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean);

/** Tên Google trả về có chứa đủ nhiều từ của tên cần tìm không (tránh lấy nhầm nơi khác). */
function nameMatches(wanted: string, found: string) {
  const want = tokens(wanted);
  const have = new Set(tokens(found));
  return want.length > 0 && want.filter((t) => have.has(t)).length / want.length >= MIN_NAME_OVERLAP;
}

function distanceKm(a: LatLng, b: LatLng) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 12_742 * Math.asin(Math.sqrt(h));
}

const center = (v: Viewport): LatLng => ({
  latitude: (v.low.latitude + v.high.latitude) / 2,
  longitude: (v.low.longitude + v.high.longitude) / 2,
});

/**
 * Tra MỘT địa điểm theo tên riêng (vd "Chùa Côn Sơn") quanh khu vực `location`.
 * Trả null nếu Google không có nơi nào trùng tên trong bán kính cho phép.
 */
export async function findPlaceByName(
  kind: ExternalPlaceKind,
  name: string,
  location: string,
  hint?: string,
): Promise<Place | null> {
  const queryKey = `${SOURCE}:name-v1|${kind}|${norm(location)}|${norm(name)}|${norm(hint ?? "")}`;

  const cached = await prisma.externalPlaceSearch.findUnique({ where: { queryKey } });
  if (cached && cached.expiresAt > new Date()) {
    const row = cached.placeIds[0]
      ? await prisma.externalPlace.findUnique({ where: { id: cached.placeIds[0] } })
      : null;
    return row ? toPlace(row) : null;
  }

  const resolved = await resolveArea(location);
  if (!resolved || "ambiguous" in resolved) return null;

  const origin = center(resolved.viewport);
  const results = await searchPlacesText({
    textQuery: [name, hint, resolved.label].filter(Boolean).join(", "),
    pageSize: 5,
  });
  const match = results.find(
    (p) =>
      p.displayName?.text &&
      p.location &&
      p.businessStatus !== "CLOSED_PERMANENTLY" &&
      nameMatches(name, p.displayName.text) &&
      distanceKm(origin, p.location) <= NAME_LOOKUP_RADIUS_KM,
  );
  const row = match ? await saveGooglePlace(kind, match) : null;

  const placeIds = row ? [row.id] : [];
  const expiresAt = new Date(Date.now() + (row ? CACHE_TTL_MS : AREA_MISS_TTL_MS));
  await prisma.externalPlaceSearch.upsert({
    where: { queryKey },
    create: { queryKey, placeIds, expiresAt },
    update: { placeIds, expiresAt },
  });
  return row ? toPlace(row) : null;
}

/** Tìm địa điểm theo nhu cầu trong đúng khu vực, cache kết quả 30 ngày. */
export async function searchPlaces(
  kind: ExternalPlaceKind,
  keyword: string,
  location: string,
): Promise<PlaceSearchResult> {
  const queryKey = `${SOURCE}:v10|${kind}|${norm(location)}|${norm(keyword)}`;

  const cached = await prisma.externalPlaceSearch.findUnique({ where: { queryKey } });
  if (cached && cached.expiresAt > new Date()) {
    const rows = await prisma.externalPlace.findMany({ where: { id: { in: cached.placeIds } } });
    const byId = new Map(rows.map((r) => [r.id, r]));
    const places = cached.placeIds.flatMap((id) => (byId.has(id) ? [toPlace(byId.get(id)!)] : []));
    // Lấy tên khu vực đầy đủ (vd "Chí Linh, Hải Phòng") thay cho chuỗi người dùng nhập
    const area = (await cachedArea(location).catch(() => null))?.result;
    return { status: "ok", area: area && "label" in area ? area.label : location, places };
  }

  // Tên trùng/không tìm thấy thì không ghi cache kết quả, để lần sau vẫn hỏi lại người dùng
  const resolved = await resolveArea(location);
  if (!resolved) return { status: "not_found" };
  if ("ambiguous" in resolved) return { status: "ambiguous", options: resolved.ambiguous };

  const isDest = kind === "destination";
  const viewport =
    isDest && isFormerProvince(location) ? expand(resolved.viewport, MIN_SPAN_FORMER_PROVINCE_DEG) : resolved.viewport;
  const results = await searchPlacesText({
    textQuery: keyword,
    ...(isDest ? {} : { includedType: GOOGLE_TYPE[kind] }),
    pageSize: isDest ? DESTINATION_POOL_SIZE : PAGE_SIZE,
    restrictTo: viewport,
  });
  let usable = results.filter(
    (p) =>
      p.displayName?.text &&
      p.location &&
      inside(p.location, viewport) &&
      p.businessStatus !== "CLOSED_PERMANENTLY",
  );
  if (isDest) {
    usable = usable
      .filter(isDestination)
      .sort((a, b) => (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0))
      .slice(0, PAGE_SIZE);
  }
  const rows = await Promise.all(usable.map((p) => saveGooglePlace(kind, p)));

  const placeIds = rows.map((r) => r.id);
  // Không có kết quả chỉ cache ngắn để sớm tìm lại khi logic/dữ liệu Google thay đổi
  const expiresAt = new Date(Date.now() + (rows.length > 0 ? CACHE_TTL_MS : AREA_MISS_TTL_MS));
  await prisma.externalPlaceSearch.upsert({
    where: { queryKey },
    create: { queryKey, placeIds, expiresAt },
    update: { placeIds, expiresAt },
  });

  return { status: "ok", area: resolved.label, places: rows.map(toPlace) };
}
