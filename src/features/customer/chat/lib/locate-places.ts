import type { ExternalPlaceKind } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type GooglePlace,
  searchGoogleMapsBatch,
} from "@/lib/gmaps-omkar";
import {
  type Extra,
  type ExternalPlaceResult,
  normalize,
  type StoredPlace,
  toResult,
} from "./external-places";
import { truncate } from "./format";

// Omkar giới hạn 1.000 request/tháng (gói free) → cache rất lâu; kết quả rỗng cũng cache (cache âm)
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

// ───────────────────────── Cache + Omkar ─────────────────────────

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
        source: "omkar",
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

// Dedupe trong process: nhiều tool call song song cùng tên chỉ tốn 1 lượt scrape
const inFlight = new Map<string, Promise<Lookup>>();

/** Tầng 1 + 2: cache theo truy vấn, rồi địa điểm đã lưu. null = cache miss, cần scrape */
async function lookupCached(
  kind: ExternalPlaceKind,
  province: string,
  name: string,
): Promise<Lookup | null> {
  const key = serpKey(kind, province, name);
  const exactKey = `${key}|exact`;

  const cached = await prisma.externalPlaceSearch.findMany({
    where: { queryKey: { in: [key, exactKey] }, expiresAt: { gt: new Date() } },
  });
  if (cached.length > 0) {
    const hit = cached[0];
    return { exact: hit.queryKey === exactKey, rows: await loadRows(hit.placeIds) };
  }

  const stored = await findStoredGooglePlace(kind, province, name);
  return stored ? { exact: true, rows: [stored] } : null;
}

// Mọi truy vấn phát sinh trong một khoảng ngắn (kể cả từ nhiều lần gọi locatePlaces song song:
// hotel/restaurant/destination) được dồn thành một lô: kiểm soát số request (Omkar giới hạn 5/giây).
const BATCH_WINDOW_MS = 250;

type PendingScrape = {
  kind: ExternalPlaceKind;
  province: string;
  name: string;
  resolve: (lookup: Lookup) => void;
  reject: (error: unknown) => void;
};

let pendingScrapes: PendingScrape[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function storeLookup(
  item: PendingScrape,
  result: { exact: boolean; places: GooglePlace[] },
): Promise<Lookup> {
  const key = serpKey(item.kind, item.province, item.name);
  const ids = await storeGooglePlaces(item.kind, item.province, result.places);
  const queryKey = result.exact ? `${key}|exact` : key;
  const ttl = ids.length > 0 ? SERP_CACHE_TTL_MS : SERP_EMPTY_CACHE_TTL_MS;
  const expiresAt = new Date(Date.now() + ttl);
  await prisma.externalPlaceSearch.upsert({
    where: { queryKey },
    create: { queryKey, placeIds: ids, expiresAt },
    update: { placeIds: ids, expiresAt },
  });
  return { exact: result.exact, rows: await loadRows(ids) };
}

async function flushScrapes(): Promise<void> {
  const batch = pendingScrapes;
  pendingScrapes = [];
  flushTimer = null;
  if (batch.length === 0) return;

  const queries = batch.map(
    (item) => `${stripTrailingProvince(item.name, item.province)} ${item.province}`,
  );
  console.info(`[gmaps] ${queries.length} truy vấn (cache miss):`, queries);
  try {
    const results = await searchGoogleMapsBatch(queries);
    await Promise.all(
      batch.map((item, idx) =>
        storeLookup(item, results[idx]).then(item.resolve, item.reject),
      ),
    );
  } catch (error) {
    batch.forEach((item) => item.reject(error));
  }
}

/** Xếp một truy vấn vào hàng đợi scrape; trả về khi job chứa nó hoàn tất */
function enqueueScrape(kind: ExternalPlaceKind, province: string, name: string): Promise<Lookup> {
  return new Promise<Lookup>((resolve, reject) => {
    pendingScrapes.push({ kind, province, name, resolve, reject });
    flushTimer ??= setTimeout(() => void flushScrapes(), BATCH_WINDOW_MS);
  });
}

/** Tra cứu mọi tên: cache trước, phần còn thiếu gộp thành một job scrape. Kết quả theo thứ tự `names`. */
async function lookupAll(
  kind: ExternalPlaceKind,
  province: string,
  names: string[],
): Promise<Lookup[]> {
  const cached = await Promise.all(names.map((name) => lookupCached(kind, province, name)));
  const keys = names.map((name) => serpKey(kind, province, name));
  const out: Promise<Lookup>[] = new Array(names.length);

  const firstIdxByKey = new Map<string, number>();
  const toScrape: number[] = [];
  names.forEach((_, idx) => {
    const hit = cached[idx];
    if (hit) {
      out[idx] = Promise.resolve(hit);
      return;
    }
    const pending = inFlight.get(keys[idx]);
    if (pending) {
      out[idx] = pending;
    } else if (!firstIdxByKey.has(keys[idx])) {
      firstIdxByKey.set(keys[idx], idx);
      toScrape.push(idx);
    }
  });

  toScrape.forEach((idx) => {
    const task = enqueueScrape(kind, province, names[idx]);
    inFlight.set(keys[idx], task);
    const cleanup = () => {
      inFlight.delete(keys[idx]);
    };
    task.then(cleanup, cleanup);
    out[idx] = task;
  });

  // Tên trùng key với tên đã xếp hàng trong cùng lượt dùng chung kết quả
  names.forEach((_, idx) => {
    if (!out[idx]) out[idx] = out[firstIdxByKey.get(keys[idx])!];
  });
  return Promise.all(out);
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

function resolve(province: string, name: string, lookup: Lookup): Resolution {
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
 * Nguồn duy nhất: Google Maps qua Omkar (cache DB nhiều tầng), không fallback.
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
  // Luôn tra Google Maps (sau cache); không fallback — dịch vụ lỗi/hết hạn mức thì lỗi nổi lên cho tool
  const names = requested.map((candidate) => candidate.name.trim());
  const lookups = await lookupAll(kind, province, names);
  const resolutions = lookups.map((lookup, idx) => resolve(province, names[idx], lookup));

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

/** Lấy địa điểm AI đã chọn từ danh sách ứng viên (không tốn lượt scrape) */
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
