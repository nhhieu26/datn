import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

function getTourIndex() {
  return pinecone
    .index(process.env.PINECONE_INDEX!)
    .namespace(process.env.PINECONE_NAMESPACE_TOURS || "tours");
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
