import type { ExternalPlaceKind } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type GooglePlace,
  SerpApiUnavailableError,
  searchGoogleMaps,
} from "@/lib/serpapi";
import {
  type Extra,
  type ExternalPlaceResult,
  normalize,
  searchExternalPlaces,
  type StoredPlace,
  toResult,
} from "./external-places";
import { truncate } from "./format";

// SerpApi free chỉ 250 lượt/tháng → cache rất lâu; kết quả rỗng cũng cache (cache âm)
const SERP_CACHE_TTL_MS = 180 * 24 * 60 * 60 * 1000;
const SERP_EMPTY_CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const GOOGLE_SOURCE = "google"; // giá trị osmType cho địa điểm lấy từ Google Maps
const MIN_CANDIDATE_SCORE = 0.34;
// Các ứng viên khớp hoàn toàn nằm gần nhau hơn ngưỡng này coi là cùng một nơi (bản ghi trùng/chi nhánh sát nhau)
const SAME_PLACE_RADIUS_M = 300;

function distanceMeters(a: StoredPlace, b: StoredPlace): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const lat1 = Number(a.latitude);
  const lat2 = Number(b.latitude);
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(Number(b.longitude) - Number(a.longitude));
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

/** Bỏ tên tỉnh ở cuối tên nếu model đã ghép sẵn, tránh truy vấn "Maia Resort Quy Nhơn Quy Nhơn" */
function stripTrailingProvince(name: string, province: string): string {
  const nameTokens = tokenize(name);
  const provinceTokens = tokenize(province);
  const n = provinceTokens.length;
  const endsWithProvince =
    n > 0 &&
    nameTokens.length > n &&
    provinceTokens.every((t, i) => nameTokens[nameTokens.length - n + i] === t);
  if (!endsWithProvince) return name;
  // Cắt đúng số từ cuối trong chuỗi gốc (giữ dấu)
  const words = name.trim().split(/\s+/);
  return words.slice(0, Math.max(1, words.length - n)).join(" ").replace(/[,\-–\s]+$/, "");
}

// ───────────────────────── Chấm điểm độ giống tên ─────────────────────────

// Từ chung không giúp phân biệt địa điểm
const STOP_WORDS = new Set([
  "khach", "san", "hotel", "resort", "spa", "and", "quan", "nha", "hang",
  "restaurant", "homestay", "villa", "bai", "bien", "tam", "beach", "khu",
  "du", "lich", "cafe", "coffee", "the", "va",
]);

const deaccent = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

const tokenize = (value: string) =>
  deaccent(value).split(/[^a-z0-9]+/).filter(Boolean);

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

/** Token đặc trưng của tên: bỏ từ chung và tên tỉnh (nếu bỏ hết thì giữ nguyên) */
function keyTokens(name: string, province: string): string[] {
  const provinceTokens = new Set(tokenize(province));
  const all = tokenize(name);
  const filtered = all.filter((t) => !STOP_WORDS.has(t) && !provinceTokens.has(t));
  return filtered.length > 0 ? filtered : all;
}

/** Tỉ lệ token đặc trưng của tên truy vấn có trong tên địa điểm (cho phép lệch 1 ký tự với từ dài) */
function nameScore(query: string, candidate: string, province: string): number {
  const queryTokens = keyTokens(query, province);
  const candidateTokens = tokenize(candidate);
  if (queryTokens.length === 0) return 0;
  const matched = queryTokens.filter((t) =>
    candidateTokens.some((c) => c === t || (t.length >= 5 && levenshtein(t, c) <= 1)),
  ).length;
  return matched / queryTokens.length;
}

// ───────────────────────── Cache + SerpApi ─────────────────────────

type Lookup = {
  // true: địa điểm đầu tiên là khớp chắc chắn (Google trả place_results)
  exact: boolean;
  rows: StoredPlace[];
};

const serpKey = (kind: ExternalPlaceKind, province: string, name: string) =>
  ["serp", kind, normalize(province), normalize(stripTrailingProvince(name, province))].join("|");

async function loadRows(ids: string[]): Promise<StoredPlace[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.externalPlace.findMany({ where: { id: { in: ids } } });
  const rank = new Map(ids.map((id, idx) => [id, idx]));
  return rows.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
}

async function storeGooglePlaces(
  kind: ExternalPlaceKind,
  province: string,
  places: GooglePlace[],
): Promise<string[]> {
  const stored = await prisma.$transaction(
    places.map((place) => {
      const extra: Extra = {
        source: "serpapi",
        placeId: place.placeId,
        ...(place.rating != null ? { rating: place.rating } : {}),
        ...(place.reviews != null ? { reviews: place.reviews } : {}),
        ...(place.thumbnail ? { thumbnail: place.thumbnail } : {}),
        ...(place.phone ? { phone: place.phone } : {}),
        ...(place.website ? { website: place.website } : {}),
        ...(place.openingHours ? { openingHours: place.openingHours } : {}),
      };
      const data = {
        kind,
        name: place.title,
        address: place.address ?? "",
        province,
        latitude: place.latitude,
        longitude: place.longitude,
        category: GOOGLE_SOURCE,
        type: place.type ?? "",
        extra,
      };
      return prisma.externalPlace.upsert({
        where: { osmType_osmId: { osmType: GOOGLE_SOURCE, osmId: place.placeId } },
        create: { osmType: GOOGLE_SOURCE, osmId: place.placeId, ...data },
        update: data,
        select: { id: true },
      });
    }),
  );
  return stored.map((s) => s.id);
}

/** Tầng 2: địa điểm Google đã lưu từ trước có tên khớp hoàn toàn (bắt các biến thể tên) */
async function findStoredGooglePlace(
  kind: ExternalPlaceKind,
  province: string,
  name: string,
): Promise<StoredPlace | null> {
  const rows = await prisma.externalPlace.findMany({
    where: {
      osmType: GOOGLE_SOURCE,
      kind,
      province: { equals: province, mode: "insensitive" },
    },
  });
  const matches = rows.filter((row) => nameScore(name, row.name, province) === 1);
  if (matches.length === 0) return null;
  // Nhiều bản ghi cùng khớp: chỉ tự chọn khi chúng sát nhau (bản ghi trùng), không chọn khi là các nơi khác nhau
  const sameSpot = matches.every((m) => distanceMeters(m, matches[0]) <= SAME_PLACE_RADIUS_M);
  return sameSpot ? matches[0] : null;
}

// Dedupe trong process: nhiều tool call song song cùng tên chỉ tốn 1 lượt SerpApi
const inFlight = new Map<string, Promise<Lookup>>();

async function lookupGoogle(
  kind: ExternalPlaceKind,
  province: string,
  name: string,
): Promise<Lookup> {
  const key = serpKey(kind, province, name);
  const exactKey = `${key}|exact`;

  // Tầng 1: cache theo truy vấn
  const cached = await prisma.externalPlaceSearch.findMany({
    where: { queryKey: { in: [key, exactKey] }, expiresAt: { gt: new Date() } },
  });
  if (cached.length > 0) {
    const hit = cached[0];
    return { exact: hit.queryKey === exactKey, rows: await loadRows(hit.placeIds) };
  }

  // Tầng 2: địa điểm đã lưu từ lần tìm khác
  const stored = await findStoredGooglePlace(kind, province, name);
  if (stored) return { exact: true, rows: [stored] };

  // Tầng 3: gọi SerpApi (dedupe in-flight)
  const pending = inFlight.get(key);
  if (pending) return pending;

  const task = (async (): Promise<Lookup> => {
    const q = `${stripTrailingProvince(name, province)} ${province}`;
    console.info(`[serpapi] call q="${q}" (cache miss)`);
    const result = await searchGoogleMaps(q);
    const ids = await storeGooglePlaces(kind, province, result.places);

    const queryKey = result.exact ? exactKey : key;
    const ttl = ids.length > 0 ? SERP_CACHE_TTL_MS : SERP_EMPTY_CACHE_TTL_MS;
    const expiresAt = new Date(Date.now() + ttl);
    await prisma.externalPlaceSearch.upsert({
      where: { queryKey },
      create: { queryKey, placeIds: ids, expiresAt },
      update: { placeIds: ids, expiresAt },
    });
    return { exact: result.exact, rows: await loadRows(ids) };
  })();

  inFlight.set(key, task);
  try {
    return await task;
  } finally {
    inFlight.delete(key);
  }
}

// ───────────────────────── Fallback Nominatim ─────────────────────────

// Tiền tố chung mà tên trên OSM thường lược bỏ (vd: "Bãi Kỳ Co" → "Kỳ Co")
const GENERIC_PREFIX =
  /^(bãi biển|bãi tắm|bãi|quán ăn|quán|nhà hàng|khách sạn|homestay|resort|chùa|đền|bảo tàng|thác|đảo|hòn)\s+/i;

async function geocodeWithNominatim(
  kind: ExternalPlaceKind,
  province: string,
  name: string,
): Promise<ExternalPlaceResult | null> {
  const variants = [name];
  const stripped = name.replace(GENERIC_PREFIX, "").trim();
  if (stripped && stripped !== name) variants.push(stripped);

  for (const variant of variants) {
    // strict: chỉ tìm "tên, tỉnh" để không khớp nhầm địa điểm trùng tên ở tỉnh khác
    const [located] = await searchExternalPlaces({
      kind,
      province,
      name: variant,
      limit: 1,
      strict: true,
    });
    // Nominatim hay khớp nhầm theo 1 từ chung ("Chùa Cầu" → "Cầu Sông Đò"): bắt buộc tên phải khớp đủ
    if (located && nameScore(name, located.name, province) === 1) return located;
  }
  return null;
}

// ───────────────────────── API cho tool ─────────────────────────

export type PlaceCandidate = {
  name: string;
  address?: string;
  summary?: string;
};

export type LocatedPlace = ExternalPlaceResult & { summary: string | null };

export type AmbiguousPlace = {
  query: string;
  candidates: {
    id: string;
    name: string;
    address: string;
    type: string;
    rating: number | null;
    reviewCount: number | null;
  }[];
};

export type LocatePlacesOutput = {
  places: LocatedPlace[];
  // Có vài địa điểm gần giống: AI chọn đúng cái rồi gọi confirmPlaces với id
  ambiguous: AmbiguousPlace[];
  unlocated: string[];
};

type Resolution =
  | { status: "located"; place: ExternalPlaceResult }
  | { status: "ambiguous"; candidates: { row: StoredPlace; score: number }[] }
  | { status: "unlocated" };

async function resolve(
  kind: ExternalPlaceKind,
  province: string,
  name: string,
): Promise<Resolution> {
  let lookup: Lookup;
  try {
    lookup = await lookupGoogle(kind, province, name);
  } catch (error) {
    if (!(error instanceof SerpApiUnavailableError)) throw error;
    console.warn(`[serpapi] không dùng được, fallback Nominatim: ${error.message}`);
    const located = await geocodeWithNominatim(kind, province, name);
    return located ? { status: "located", place: located } : { status: "unlocated" };
  }

  if (lookup.rows.length === 0) return { status: "unlocated" };
  if (lookup.exact) {
    return { status: "located", place: toResult(lookup.rows[0], province) };
  }

  const scored = lookup.rows
    .map((row) => ({ row, score: nameScore(name, row.name, province) }))
    .sort((a, b) => b.score - a.score);
  const [best, second] = scored;
  // Khớp đủ mọi từ đặc trưng, và các ứng viên khớp ngang (nếu có) đều sát vị trí → nhận ứng viên Google xếp cao nhất
  if (best.score === 1) {
    const ties = scored.filter((c) => c.score === 1);
    const sameSpot = ties.every((c) => distanceMeters(c.row, ties[0].row) <= SAME_PLACE_RADIUS_M);
    if (!second || second.score < 1 || sameSpot) {
      const top = lookup.rows.find((row) => ties.some((c) => c.row.id === row.id))!;
      return { status: "located", place: toResult(top, province) };
    }
  }
  const candidates = scored.filter((c) => c.score >= MIN_CANDIDATE_SCORE);
  return candidates.length > 0 ? { status: "ambiguous", candidates } : { status: "unlocated" };
}

/**
 * Định vị các địa điểm mà model đã tìm được bằng google_search.
 * Nguồn chính: Google Maps qua SerpApi (cache DB nhiều tầng); fallback: Nominatim.
 */
export async function locatePlaces({
  kind,
  province,
  places: requested,
}: {
  kind: ExternalPlaceKind;
  province: string;
  places: PlaceCandidate[];
}): Promise<LocatePlacesOutput> {
  const resolutions = await Promise.all(
    requested.map((candidate) =>
      resolve(kind, province, candidate.name.trim()).catch((error) => {
        console.warn(`Định vị thất bại cho "${candidate.name}":`, error);
        return { status: "unlocated" } as const;
      }),
    ),
  );

  const places: LocatedPlace[] = [];
  const ambiguous: AmbiguousPlace[] = [];
  const unlocated: string[] = [];
  const seen = new Set<string>();

  resolutions.forEach((resolution, idx) => {
    const candidate = requested[idx];
    if (resolution.status === "located") {
      if (seen.has(resolution.place.id)) return;
      seen.add(resolution.place.id);
      places.push({
        ...resolution.place,
        address: resolution.place.address || candidate.address || "",
        summary: truncate(candidate.summary ?? null, 240),
      });
    } else if (resolution.status === "ambiguous") {
      ambiguous.push({
        query: candidate.name,
        candidates: resolution.candidates.map(({ row }) => {
          const result = toResult(row, province);
          return {
            id: result.id,
            name: result.name,
            address: result.address,
            type: result.type,
            rating: result.rating,
            reviewCount: result.reviewCount,
          };
        }),
      });
    } else {
      unlocated.push(candidate.name);
    }
  });

  console.info(
    `[locatePlaces] ${kind} @ ${province}: ${requested.length} tên → ${places.length} định vị, ${ambiguous.length} cần chọn, ${unlocated.length} không định vị được`,
  );
  return { places, ambiguous, unlocated };
}

/** Lấy địa điểm AI đã chọn từ danh sách ứng viên (không tốn lượt SerpApi) */
export async function confirmPlaces(
  choices: { id: string; summary?: string }[],
): Promise<{ places: LocatedPlace[] }> {
  const rows = await loadRows(choices.map((c) => c.id));
  const summaryById = new Map(choices.map((c) => [c.id, c.summary]));
  return {
    places: rows.map((row) => ({
      ...toResult(row, row.province ?? ""),
      summary: truncate(summaryById.get(row.id) ?? null, 240),
    })),
  };
}
