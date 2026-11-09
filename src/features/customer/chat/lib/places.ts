import type { ExternalPlace, ExternalPlaceKind } from "@/generated/prisma/client";
import { type GooglePlace, searchPlacesText } from "@/lib/google-maps";
import { prisma } from "@/lib/prisma";

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SOURCE = "gplaces";

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

type Extra = {
  url?: string;
  rating?: number;
  reviewCount?: number;
  openingHours?: string;
  photo?: string;
};

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

/** Tìm địa điểm trên Google Maps, cache kết quả trong DB 30 ngày. */
export async function searchPlaces(kind: ExternalPlaceKind, query: string): Promise<Place[]> {
  const queryKey = `${SOURCE}:v6|${kind}|${query.trim().toLowerCase()}`;

  const cached = await prisma.externalPlaceSearch.findUnique({ where: { queryKey } });
  if (cached && cached.expiresAt > new Date()) {
    const rows = await prisma.externalPlace.findMany({ where: { id: { in: cached.placeIds } } });
    const byId = new Map(rows.map((r) => [r.id, r]));
    return cached.placeIds.flatMap((id) => (byId.has(id) ? [toPlace(byId.get(id)!)] : []));
  }

  const results = await searchPlacesText({ textQuery: query, includedType: GOOGLE_TYPE[kind], pageSize: 8 });
  const usable = results.filter(
    (p) => p.displayName?.text && p.location && p.businessStatus !== "CLOSED_PERMANENTLY",
  );
  const rows = await Promise.all(usable.map((p) => saveGooglePlace(kind, p)));

  const placeIds = rows.map((r) => r.id);
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
  await prisma.externalPlaceSearch.upsert({
    where: { queryKey },
    create: { queryKey, placeIds, expiresAt },
    update: { placeIds, expiresAt },
  });

  return rows.map(toPlace);
}
