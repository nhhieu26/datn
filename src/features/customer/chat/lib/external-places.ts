import type { ExternalPlaceKind } from "@/generated/prisma/client";
import { type OmkarPlace, searchGoogleMaps } from "@/lib/omkar";
import { prisma } from "@/lib/prisma";
import { num, sameName, stripDiacritics, truncate } from "./format";

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const EMPTY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const RESULTS_PER_LOOKUP = 3;
// Cột osmType của bảng cache dùng để ghi nguồn dữ liệu
const SOURCE = "gmaps";

// Phạm vi hợp lệ của tọa độ: lãnh thổ Việt Nam (kể cả các đảo gần bờ)
const VN_BOUNDS = { minLat: 8, maxLat: 24, minLng: 102, maxLng: 110 };

export type ExternalPlaceResult = {
  source: "external";
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

// Google Maps URLs API theo tọa độ — dùng khi kết quả không có link riêng
const googleMapsUrl = (latitude: number, longitude: number) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

type StoredPlace = Awaited<ReturnType<typeof prisma.externalPlace.findMany>>[number];

function toResult(p: StoredPlace, fallbackProvince: string): ExternalPlaceResult {
  const extra = (p.extra ?? {}) as Extra;
  const latitude = num(p.latitude)!;
  const longitude = num(p.longitude)!;
  return {
    source: "external",
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

// Chọn kết quả Google Maps đúng địa điểm: khớp tên, còn hoạt động, tọa độ nằm trong Việt Nam
function pickMatch(results: OmkarPlace[], name: string): OmkarPlace | null {
  return (
    results.find(
      (r) =>
        r.coordinates &&
        inVietnam(r.coordinates.latitude, r.coordinates.longitude) &&
        !r.is_permanently_closed &&
        r.business_status !== "CLOSED" &&
        sameName(r.name, name),
    ) ?? null
  );
}

async function storePlace(kind: ExternalPlaceKind, place: OmkarPlace) {
  const { latitude, longitude } = place.coordinates!;
  const externalId = place.place_id ?? place.data_id ?? place.kgmid ?? `${latitude},${longitude}`;
  const extra: Extra = Object.fromEntries(
    Object.entries({
      link: place.link,
      description: place.description,
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
    province: place.detailed_address?.city ?? null,
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
 * Tra một địa điểm ngoài hệ thống Roamly theo tên trên Google Maps (Omkar API), có cache trong CSDL.
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

  const cached = await prisma.externalPlaceSearch.findUnique({ where: { queryKey } });
  let placeId: string | undefined;

  if (cached && cached.expiresAt > new Date()) {
    placeId = cached.placeIds[0];
  } else {
    // Query không dấu cho kết quả khớp tên chính xác hơn trên Google Maps
    const results = await searchGoogleMaps({
      query: stripDiacritics(`${name}, ${area}`),
      limit: RESULTS_PER_LOOKUP,
    });
    const match = pickMatch(results, name);
    placeId = match ? (await storePlace(kind, match)).id : undefined;

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
