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
  provinceIds?: string[]
): Promise<string[]> {
  const res = await getTourIndex().query({
    vector,
    topK,
    filter: {
      status: { $eq: "published" },
      ...buildProvinceFilter(provinceIds),
    },
  });
  return res.matches.map((m) => m.id);
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

