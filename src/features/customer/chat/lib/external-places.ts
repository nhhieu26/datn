import type { ExternalPlaceKind } from "@/generated/prisma/client";
import { type NominatimPlace, searchNominatim } from "@/lib/nominatim";
import { prisma } from "@/lib/prisma";
import { num, truncate } from "./format";

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const EMPTY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_STORED_PER_QUERY = 10;

// Phạm vi hợp lệ của tọa độ: lãnh thổ Việt Nam (kể cả các đảo gần bờ)
const VN_BOUNDS = { minLat: 8, maxLat: 24, minLng: 102, maxLng: 110 };

// Loại đối tượng OSM được chấp nhận cho từng nhóm địa điểm. "*" = mọi type.
const KIND_FILTER: Record<ExternalPlaceKind, Record<string, string[] | "*">> = {
  hotel: {
    tourism: ["hotel", "guest_house", "hostel", "motel", "apartment", "resort", "chalet"],
  },
  restaurant: {
    amenity: ["restaurant", "cafe", "fast_food", "food_court", "bar", "pub", "ice_cream"],
  },
  destination: {
    tourism: ["attraction", "viewpoint", "museum", "theme_park", "zoo", "gallery", "aquarium"],
    historic: "*",
    natural: ["beach", "peak", "cave_entrance", "bay", "waterfall", "volcano", "cape"],
    leisure: ["park", "nature_reserve", "garden", "beach_resort"],
    amenity: ["place_of_worship"],
    man_made: ["bridge", "lighthouse", "tower"],
    bridge: "*",
  },
};

// Special phrase tiếng Anh mà Nominatim hiểu để tìm theo loại trong một khu vực
const KIND_PHRASES: Record<ExternalPlaceKind, string[]> = {
  hotel: ["hotels in", "guest houses in"],
  restaurant: ["restaurants in", "cafes in"],
  destination: ["tourist attractions in", "viewpoints in", "museums in"],
};

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
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  cuisine: string | null;
  stars: string | null;
};

type Extra = {
  phone?: string;
  website?: string;
  openingHours?: string;
  cuisine?: string;
  stars?: string;
};

const normalize = (value: string) =>
  value.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();

function matchesKind(kind: ExternalPlaceKind, place: NominatimPlace): boolean {
  const allowed = KIND_FILTER[kind][place.category];
  if (!allowed) return false;
  return allowed === "*" || allowed.includes(place.type);
}

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

function placeName(place: NominatimPlace): string | null {
  return (
    place.namedetails?.["name:vi"] ??
    place.name ??
    place.namedetails?.name ??
    null
  )?.trim() || null;
}

function buildAddress(place: NominatimPlace, name: string): string {
  const a = place.address ?? {};
  const parts = [
    [a.house_number, a.road].filter(Boolean).join(" "),
    a.quarter ?? a.suburb ?? a.village,
    a.city_district ?? a.county,
  ].filter((p): p is string => !!p && p !== name);
  if (parts.length > 0) return parts.join(", ");
  // Không có địa chỉ chi tiết: bỏ tên và quốc gia khỏi display_name
  return place.display_name
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && s !== name && s !== "Việt Nam")
    .slice(0, 3)
    .join(", ");
}

function provinceOf(place: NominatimPlace): string | null {
  const a = place.address ?? {};
  return a.state ?? a.city ?? a.province ?? null;
}

function pickExtra(place: NominatimPlace): Extra {
  const t = place.extratags ?? {};
  const extra: Extra = {
    phone: t.phone ?? t["contact:phone"],
    website: t.website ?? t["contact:website"],
    openingHours: t.opening_hours,
    cuisine: t.cuisine?.replace(/;/g, ", ").replace(/_/g, " "),
    stars: t.stars,
  };
  return Object.fromEntries(
    Object.entries(extra).filter(([, v]) => typeof v === "string" && v.length > 0),
  ) as Extra;
}

// Google Maps URLs API theo tọa độ: luôn ghim đúng vị trí marker (tìm theo tên dễ ra danh sách trùng tên)
const googleMapsUrl = (latitude: number, longitude: number) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

type StoredPlace =Awaited<ReturnType<typeof prisma.externalPlace.findMany>>[number];

function toResult(p: StoredPlace, fallbackProvince: string): ExternalPlaceResult {
  const extra = (p.extra ?? {}) as Extra;
  return {
    source: "external",
    kind: p.kind,
    name: p.name,
    url: googleMapsUrl(num(p.latitude)!, num(p.longitude)!),
    province: p.province ?? fallbackProvince,
    address: p.address,
    latitude: num(p.latitude)!,
    longitude: num(p.longitude)!,
    type: p.type,
    phone: extra.phone ?? null,
    website: extra.website ?? null,
    openingHours: truncate(extra.openingHours, 120),
    cuisine: extra.cuisine ?? null,
    stars: extra.stars ?? null,
  };
}

async function fetchFromNominatim(
  kind: ExternalPlaceKind,
  province: string,
  name?: string,
): Promise<NominatimPlace[]> {
  const queries = name
    ? [`${name}, ${province}`, name]
    : KIND_PHRASES[kind].map((phrase) => `${phrase} ${province}`);

  const seen = new Set<string>();
  const accepted: NominatimPlace[] = [];

  for (const q of queries) {
    const places = await searchNominatim({ q, limit: 10 });
    for (const place of places) {
      const key = `${place.osm_type}/${place.osm_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (!matchesKind(kind, place)) continue;
      if (!placeName(place)) continue;
      if (!inVietnam(Number(place.lat), Number(place.lon))) continue;
      accepted.push(place);
    }
    if (accepted.length >= MAX_STORED_PER_QUERY / 2) break;
  }

  return accepted.slice(0, MAX_STORED_PER_QUERY);
}

/**
 * Tìm địa điểm ngoài hệ thống Roamly qua OpenStreetMap (Nominatim), có cache trong CSDL.
 * Mọi kết quả trả về đều có tọa độ hợp lệ nằm trong lãnh thổ Việt Nam.
 */
export async function searchExternalPlaces({
  kind,
  province,
  name,
  limit,
}: {
  kind: ExternalPlaceKind;
  province: string;
  name?: string;
  limit: number;
}): Promise<ExternalPlaceResult[]> {
  const trimmedName = name?.trim() || undefined;
  const queryKey = [kind, normalize(province), normalize(trimmedName ?? "")].join("|");

  const cached = await prisma.externalPlaceSearch.findUnique({ where: { queryKey } });
  let placeIds: string[];

  if (cached && cached.expiresAt > new Date()) {
    placeIds = cached.placeIds;
  } else {
    const places = await fetchFromNominatim(kind, province, trimmedName);
    const stored = await prisma.$transaction(
      places.map((place) => {
        const placeLabel = placeName(place)!;
        const data = {
          kind,
          name: placeLabel,
          address: buildAddress(place, placeLabel),
          province: provinceOf(place),
          latitude: Number(place.lat),
          longitude: Number(place.lon),
          category: place.category,
          type: place.type,
          extra: pickExtra(place),
        };
        return prisma.externalPlace.upsert({
          where: {
            osmType_osmId: { osmType: place.osm_type, osmId: String(place.osm_id) },
          },
          create: { osmType: place.osm_type, osmId: String(place.osm_id), ...data },
          update: data,
          select: { id: true },
        });
      }),
    );
    placeIds = stored.map((p) => p.id);

    // Kết quả rỗng chỉ cache ngắn hạn, để dữ liệu OSM mới bổ sung sớm được tìm thấy
    const ttl = placeIds.length > 0 ? CACHE_TTL_MS : EMPTY_CACHE_TTL_MS;
    const expiresAt = new Date(Date.now() + ttl);
    await prisma.externalPlaceSearch.upsert({
      where: { queryKey },
      create: { queryKey, placeIds, expiresAt },
      update: { placeIds, expiresAt },
    });
  }

  if (placeIds.length === 0) return [];

  const rows = await prisma.externalPlace.findMany({ where: { id: { in: placeIds } } });
  const rank = new Map(placeIds.map((id, idx) => [id, idx]));
  return rows
    .sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0))
    .slice(0, limit)
    .map((row) => toResult(row, province));
}
