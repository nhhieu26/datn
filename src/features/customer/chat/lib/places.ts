import type { ExternalPlace, ExternalPlaceKind } from "@/generated/prisma/client";
import { type GooglePlace, type LatLng, searchPlacesText, type Viewport } from "@/lib/google-maps";
import { prisma } from "@/lib/prisma";

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SOURCE = "gplaces";
// Khung tìm kiếm tối thiểu: Google trả viewport rất nhỏ cho phường (~vài km) và gần như 0 cho đảo/thắng cảnh.
// Không nới quá rộng vì ở thành phố lớn 10km đã lan sang nhiều quận khác.
const MIN_SPAN_DEG = 0.04; // ~4.5km
const MIN_SPAN_NATURAL_DEG = 0.1; // ~11km cho đảo, vịnh, núi
const NATURAL_TYPES = ["natural_feature", "island", "archipelago"];

const GOOGLE_TYPE: Record<ExternalPlaceKind, string> = {
  hotel: "lodging",
  restaurant: "restaurant",
  destination: "tourist_attraction",
};

export type Place = {
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

/**
 * "Chí Linh" → khu vực trên bản đồ. Tên trùng ở nhiều tỉnh → trả danh sách để hỏi lại.
 * Không so tên tỉnh dạng chữ vì tỉnh đã sáp nhập (Hải Dương cũ nay là Hải Phòng): tỉnh hợp lệ
 * là tỉnh mà Google trả về khi tìm cả cụm người dùng nhập.
 */
async function resolveArea(location: string): Promise<Area | { ambiguous: string[] } | null> {
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

/** Tìm địa điểm theo nhu cầu trong đúng khu vực, cache kết quả 30 ngày. */
export async function searchPlaces(
  kind: ExternalPlaceKind,
  keyword: string,
  location: string,
): Promise<PlaceSearchResult> {
  const queryKey = `${SOURCE}:v8|${kind}|${norm(location)}|${norm(keyword)}`;

  const cached = await prisma.externalPlaceSearch.findUnique({ where: { queryKey } });
  if (cached && cached.expiresAt > new Date()) {
    const rows = await prisma.externalPlace.findMany({ where: { id: { in: cached.placeIds } } });
    const byId = new Map(rows.map((r) => [r.id, r]));
    const places = cached.placeIds.flatMap((id) => (byId.has(id) ? [toPlace(byId.get(id)!)] : []));
    return { status: "ok", area: location, places };
  }

  // Tên trùng/không tìm thấy thì không ghi cache, để lần sau vẫn phải xác định lại khu vực
  const resolved = await resolveArea(location);
  if (!resolved) return { status: "not_found" };
  if ("ambiguous" in resolved) return { status: "ambiguous", options: resolved.ambiguous };

  const results = await searchPlacesText({
    textQuery: keyword,
    includedType: GOOGLE_TYPE[kind],
    pageSize: 8,
    restrictTo: resolved.viewport,
  });
  const usable = results.filter(
    (p) =>
      p.displayName?.text &&
      p.location &&
      inside(p.location, resolved.viewport) &&
      p.businessStatus !== "CLOSED_PERMANENTLY",
  );
  const rows = await Promise.all(usable.map((p) => saveGooglePlace(kind, p)));

  const placeIds = rows.map((r) => r.id);
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
  await prisma.externalPlaceSearch.upsert({
    where: { queryKey },
    create: { queryKey, placeIds, expiresAt },
    update: { placeIds, expiresAt },
  });

  return { status: "ok", area: resolved.label, places: rows.map(toPlace) };
}
