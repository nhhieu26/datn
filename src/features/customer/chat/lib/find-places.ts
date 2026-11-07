import { type ExternalPlaceResult, lookupExternalPlace } from "./external-places";
import { sameName } from "./format";
import {
  searchInternalDestinations,
  searchInternalHotels,
  searchInternalRestaurants,
} from "./internal-places";
import {
  type PlaceKind,
  type WebCandidate,
  type WebSource,
  searchWebPlaces,
} from "./web-places";

const MAX_PLACES = 5;
const INTERNAL_PER_KIND = 5;
// Lộ trình dài: mỗi loại lấy thêm ứng viên nội bộ để đủ điểm dừng
const MAX_INTERNAL_PER_KIND = 8;
// Omkar cho phép 5 req/s và tính quota theo lượt → giới hạn số địa điểm web cần tra mỗi lượt
const MAX_EXTERNAL_LOOKUPS = 5;

type InternalPlace =
  | Awaited<ReturnType<typeof searchInternalHotels>>[number]
  | Awaited<ReturnType<typeof searchInternalRestaurants>>[number]
  | Awaited<ReturnType<typeof searchInternalDestinations>>[number];

type WithContext = { reason: string | null; webMentioned: boolean };

type ExternalFound = ExternalPlaceResult & WithContext;

export type FoundPlace =
  | (InternalPlace & WithContext & { latitude: number; longitude: number })
  | ExternalFound;

// Thứ tự ưu tiên: nội bộ khớp ngữ nghĩa + web nhắc tới → web (Google Maps) → nội bộ ngữ nghĩa → nội bộ phổ biến
function priority(place: FoundPlace): number {
  if (place.source === "external") return 1;
  if (place.matchedBy === "semantic") return place.webMentioned ? 0 : 2;
  return place.webMentioned ? 1 : 3;
}

const hasCoords = (lat: number | null, lng: number | null) =>
  lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);

async function searchInternal(
  kind: PlaceKind,
  input: {
    query?: string;
    province?: string;
    maxPrice?: number;
    amenities?: string[];
    limit: number;
  },
): Promise<InternalPlace[]> {
  const base = { query: input.query, province: input.province, limit: input.limit };
  try {
    if (kind === "hotel") {
      return await searchInternalHotels({
        ...base,
        maxPrice: input.maxPrice,
        amenities: input.amenities,
      });
    }
    if (kind === "restaurant") return await searchInternalRestaurants(base);
    return await searchInternalDestinations(base);
  } catch (error) {
    console.warn(`Tìm ${kind} nội bộ thất bại:`, error);
    return [];
  }
}

// Lấy luân phiên theo loại để mỗi loại đều có lượt tra
function roundRobinByKind(candidates: WebCandidate[], limit: number): WebCandidate[] {
  const queues = new Map<PlaceKind, WebCandidate[]>();
  for (const c of candidates) queues.set(c.kind, [...(queues.get(c.kind) ?? []), c]);
  const picked: WebCandidate[] = [];
  while (picked.length < limit && [...queues.values()].some((q) => q.length > 0)) {
    for (const queue of queues.values()) {
      const next = queue.shift();
      if (next && picked.length < limit) picked.push(next);
    }
  }
  return picked;
}

// Tra Google Maps (Omkar) song song cho các địa điểm web chưa có trong Roamly
async function lookupOnGoogleMaps(
  candidates: WebCandidate[],
  province: string | undefined,
): Promise<ExternalFound[]> {
  const settled = await Promise.all(
    roundRobinByKind(candidates, MAX_EXTERNAL_LOOKUPS).map(
      async (candidate): Promise<ExternalFound | null> => {
        try {
          const place = await lookupExternalPlace({
            kind: candidate.kind,
            name: candidate.name,
            province,
          });
          return place
            ? { ...place, reason: candidate.reason || null, webMentioned: true }
            : null;
        } catch (error) {
          console.warn(`Không tra được "${candidate.name}" trên Google Maps:`, error);
          return null;
        }
      },
    ),
  );

  const seenUrls = new Set<string>();
  return settled.filter((place): place is ExternalFound => {
    if (!place || seenUrls.has(place.url)) return false;
    seenUrls.add(place.url);
    return true;
  });
}

// Chọn tối đa 5 điểm: luân phiên giữa các loại, có cả nguồn nội bộ lẫn bên ngoài nếu được
function pickPlaces(
  places: FoundPlace[],
  kinds: PlaceKind[],
  maxPlaces: number,
): FoundPlace[] {
  const queues = kinds.map((kind) =>
    places
      .filter((p) => p.kind === kind)
      .sort((a, b) => priority(a) - priority(b)),
  );

  const picked: FoundPlace[] = [];
  while (picked.length < maxPlaces && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && picked.length < maxPlaces) picked.push(next);
    }
  }

  for (const source of ["internal", "external"] as const) {
    if (picked.length < maxPlaces || picked.some((p) => p.source === source)) continue;
    const best = places
      .filter((p) => p.source === source)
      .sort((a, b) => priority(a) - priority(b))[0];
    if (best) picked[picked.length - 1] = best;
  }

  return picked;
}

/**
 * Pipeline tìm địa điểm cho chat AI:
 * 1. Tìm song song trên web (Google Search) và trong dữ liệu nội bộ (Pinecone + Prisma)
 * 2. Địa điểm web không có trong Roamly → tra Google Maps (Omkar) lấy tọa độ, địa chỉ, đánh giá
 * 3. Gộp, xếp hạng, trả về tối đa 5 địa điểm có tọa độ để hiển thị trên bản đồ
 */
export async function findPlaces({
  request,
  query,
  province,
  kinds,
  maxPrice,
  amenities,
  maxPlaces = MAX_PLACES,
}: {
  request: string;
  query?: string;
  province?: string;
  kinds: PlaceKind[];
  maxPrice?: number;
  amenities?: string[];
  // Số địa điểm tối đa trả về (lộ trình nhiều ngày cần nhiều hơn mặc định 5)
  maxPlaces?: number;
}): Promise<{ places: FoundPlace[]; webSources: WebSource[] }> {
  const uniqueKinds = [...new Set(kinds)];
  const [web, ...internalByKind] = await Promise.all([
    searchWebPlaces({ request, province, kinds: uniqueKinds }),
    ...uniqueKinds.map((kind) =>
      searchInternal(kind, {
        query: query ?? request,
        province,
        maxPrice,
        amenities,
        limit: Math.min(
          MAX_INTERNAL_PER_KIND,
          Math.max(INTERNAL_PER_KIND, Math.ceil(maxPlaces / uniqueKinds.length) + 1),
        ),
      }),
    ),
  ]);

  const unmatched: WebCandidate[] = [];
  const webReasonByUrl = new Map<string, string>();
  const internal = internalByKind.flat();
  for (const candidate of web.candidates) {
    const match = internal.find(
      (p) => p.kind === candidate.kind && sameName(p.name, candidate.name),
    );
    if (match) webReasonByUrl.set(match.url, candidate.reason);
    else unmatched.push(candidate);
  }

  const internalPlaces: FoundPlace[] = internal
    .filter((p): p is InternalPlace & { latitude: number; longitude: number } =>
      hasCoords(p.latitude, p.longitude),
    )
    .map((p) => ({
      ...p,
      reason: webReasonByUrl.get(p.url) || null,
      webMentioned: webReasonByUrl.has(p.url),
    }));

  const externalPlaces = (await lookupOnGoogleMaps(unmatched, province)).filter(
    // Google Maps có thể trả về chính dịch vụ đã có trong Roamly dưới tên khác một chút
    (ext) => !internal.some((p) => p.kind === ext.kind && sameName(p.name, ext.name)),
  );

  return {
    places: pickPlaces([...internalPlaces, ...externalPlaces], uniqueKinds, maxPlaces),
    webSources: web.sources,
  };
}
