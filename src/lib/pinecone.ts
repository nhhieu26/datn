import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

function getTourIndex() {
  return pinecone
    .index(process.env.PINECONE_INDEX!)
    .namespace(process.env.PINECONE_NAMESPACE_TOURS || "tours");
}

function getHotelIndex() {
  return pinecone
    .index(process.env.PINECONE_INDEX!)
    .namespace(process.env.PINECONE_NAMESPACE_HOTELS || "hotels");
}

export async function upsertTourEmbedding(
  id: string,
  values: number[],
  metadata: Record<string, string | number | boolean | string[]>
): Promise<void> {
  const index = getTourIndex();
  await index.upsert({ records: [{ id, values, metadata }] });
}

export async function deleteTourEmbedding(id: string): Promise<void> {
  const index = getTourIndex();
  await index.deleteOne({ id });
}

export async function clearTourEmbeddings(): Promise<void> {
  await getTourIndex().deleteAll();
}

export async function upsertHotelEmbedding(
  id: string,
  values: number[],
  metadata: Record<string, string | number | boolean | string[]>
): Promise<void> {
  const index = getHotelIndex();
  await index.upsert({ records: [{ id, values, metadata }] });
}

export async function deleteHotelEmbedding(id: string): Promise<void> {
  const index = getHotelIndex();
  await index.deleteOne({ id });
}

export async function clearHotelEmbeddings(): Promise<void> {
  await getHotelIndex().deleteAll();
}

function getRestaurantIndex() {
  return pinecone
    .index(process.env.PINECONE_INDEX!)
    .namespace(process.env.PINECONE_NAMESPACE_RESTAURANTS || "restaurants");
}

export async function upsertRestaurantEmbedding(
  id: string,
  values: number[],
  metadata: Record<string, string | number | boolean | string[]>
): Promise<void> {
  const index = getRestaurantIndex();
  await index.upsert({ records: [{ id, values, metadata }] });
}

export async function deleteRestaurantEmbedding(id: string): Promise<void> {
  const index = getRestaurantIndex();
  await index.deleteOne({ id });
}

export async function clearRestaurantEmbeddings(): Promise<void> {
  await getRestaurantIndex().deleteAll();
}

function getDestinationIndex() {
  return pinecone
    .index(process.env.PINECONE_INDEX!)
    .namespace(process.env.PINECONE_NAMESPACE_DESTINATIONS || "destinations");
}

export async function upsertDestinationEmbedding(
  id: string,
  values: number[],
  metadata: Record<string, string | number | boolean | string[]>
): Promise<void> {
  const index = getDestinationIndex();
  await index.upsert({ records: [{ id, values, metadata }] });
}

export async function deleteDestinationEmbedding(id: string): Promise<void> {
  await getDestinationIndex().deleteOne({ id });
}

export async function clearDestinationEmbeddings(): Promise<void> {
  await getDestinationIndex().deleteAll();
}

type EmbeddingIndex = ReturnType<typeof getTourIndex>;

/**
 * Đổi metadata `status` của nhiều record mà không tạo lại vector.
 * Trả về các id cập nhật thất bại (ví dụ record chưa từng được tạo).
 */
async function updateEmbeddingStatus(
  index: EmbeddingIndex,
  ids: string[],
  status: string
): Promise<string[]> {
  const results = await Promise.allSettled(
    ids.map((id) => index.update({ id, metadata: { status } }))
  );
  return ids.filter((_, i) => results[i].status === "rejected");
}

export function setTourEmbeddingStatus(ids: string[], status: string) {
  return updateEmbeddingStatus(getTourIndex(), ids, status);
}

export function setHotelEmbeddingStatus(ids: string[], status: string) {
  return updateEmbeddingStatus(getHotelIndex(), ids, status);
}

export function setRestaurantEmbeddingStatus(ids: string[], status: string) {
  return updateEmbeddingStatus(getRestaurantIndex(), ids, status);
}

function buildProvinceFilter(provinceIds?: string[]) {
  if (!provinceIds?.length) return {};
  return {
    provinceId:
      provinceIds.length === 1
        ? { $eq: provinceIds[0] }
        : { $in: provinceIds },
  };
}

export async function queryTourEmbeddings(
  vector: number[],
  topK: number,
  provinceIds?: string[],
  minScore = 0
): Promise<string[]> {
  const res = await getTourIndex().query({
    vector,
    topK,
    filter: {
      status: { $eq: "published" },
      ...buildProvinceFilter(provinceIds),
    },
  });
  return res.matches.filter((m) => (m.score ?? 0) >= minScore).map((m) => m.id);
}

export async function queryHotelEmbeddings(
  vector: number[],
  topK: number,
  provinceIds?: string[]
): Promise<string[]> {
  const res = await getHotelIndex().query({
    vector,
    topK,
    filter: {
      status: { $eq: "published" },
      ...buildProvinceFilter(provinceIds),
    },
  });
  return res.matches.map((m) => m.id);
}

export async function queryRestaurantEmbeddings(
  vector: number[],
  topK: number,
  provinceIds?: string[]
): Promise<string[]> {
  const res = await getRestaurantIndex().query({
    vector,
    topK,
    filter: {
      status: { $eq: "published" },
      ...buildProvinceFilter(provinceIds),
    },
  });
  return res.matches.map((m) => m.id);
}

export async function queryDestinationEmbeddings(
  vector: number[],
  topK: number,
  provinceIds?: string[]
): Promise<string[]> {
  const res = await getDestinationIndex().query({
    vector,
    topK,
    filter: {
      isPublished: { $eq: true },
      ...buildProvinceFilter(provinceIds),
    },
  });
  return res.matches.map((m) => m.id);
}


export type EmbeddingKind = "tour" | "hotel" | "restaurant" | "destination";

const INDEX_OF: Record<EmbeddingKind, () => EmbeddingIndex> = {
  tour: getTourIndex,
  hotel: getHotelIndex,
  restaurant: getRestaurantIndex,
  destination: getDestinationIndex,
};

/** Chỉ lấy mục đang hiển thị công khai (điểm đến dùng cờ isPublished, các loại khác dùng status). */
function publishedFilter(kind: EmbeddingKind) {
  return kind === "destination"
    ? { isPublished: { $eq: true } }
    : { status: { $eq: "published" } };
}

export type ScoredMatch = { id: string; score: number };

/** Truy vấn theo vector, trả kèm điểm cosine để xếp hạng/kết hợp với tiêu chí khác. */
export async function queryScored(
  kind: EmbeddingKind,
  vector: number[],
  topK: number,
  minScore = 0,
): Promise<ScoredMatch[]> {
  const res = await INDEX_OF[kind]().query({
    vector,
    topK,
    filter: publishedFilter(kind),
  });
  return res.matches
    .map((m) => ({ id: m.id, score: m.score ?? 0 }))
    .filter((m) => m.score >= minScore);
}

const FETCH_BATCH = 100;

/** Lấy vector đã lưu của các mục; mục chưa có vector sẽ vắng mặt trong Map. */
export async function fetchVectors(
  kind: EmbeddingKind,
  ids: string[],
): Promise<Map<string, number[]>> {
  const result = new Map<string, number[]>();
  const index = INDEX_OF[kind]();
  for (let i = 0; i < ids.length; i += FETCH_BATCH) {
    const res = await index.fetch({ ids: ids.slice(i, i + FETCH_BATCH) });
    for (const [id, record] of Object.entries(res.records ?? {})) {
      if (record?.values?.length) result.set(id, record.values);
    }
  }
  return result;
}

/** Ghi vector cho một mục bất kỳ (dùng cho script tạo embedding hàng loạt). */
export async function upsertEmbedding(
  kind: EmbeddingKind,
  id: string,
  values: number[],
  metadata: Record<string, string | number | boolean | string[]>,
): Promise<void> {
  await INDEX_OF[kind]().upsert({ records: [{ id, values, metadata }] });
}
