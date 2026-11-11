// Tạo embedding Pinecone cho các tour/khách sạn/nhà hàng/điểm đến chưa có vector
// (dữ liệu seed không đi qua server action nên chưa được embed).
//   bun run db:embed          → chỉ embed mục còn thiếu
//   bun run db:embed --force  → embed lại toàn bộ
import "dotenv/config";
import { embedText } from "../src/lib/gemini";
import { type EmbeddingKind, fetchVectors, upsertEmbedding } from "../src/lib/pinecone";
import { prisma } from "../src/lib/prisma";
import {
  buildDestinationEmbeddingText,
  buildHotelEmbeddingText,
  buildRestaurantEmbeddingText,
  buildTourEmbeddingText,
  parseMenu,
} from "../src/shared/lib/embedding-text";

const FORCE = process.argv.includes("--force");
/** Nghỉ giữa các lần gọi Gemini để tránh vượt rate limit. */
const DELAY_MS = 250;

type Metadata = Record<string, string | number | boolean | string[]>;
type Doc = { id: string; label: string; text: string; metadata: Metadata };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function tagsOf(row: { tags: { tag: { id: string; name: string } }[] }) {
  return row.tags.map((t) => t.tag);
}

async function tourDocs(): Promise<Doc[]> {
  const rows = await prisma.tour.findMany({
    where: { status: "published", deletedAt: null },
    include: { province: true, tags: { include: { tag: true } } },
  });
  return rows.map((t) => {
    const tags = tagsOf(t);
    return {
      id: t.id,
      label: t.title,
      text: buildTourEmbeddingText(
        {
          ...t,
          itinerary: Array.isArray(t.itinerary)
            ? (t.itinerary as { title?: unknown }[]).map((d) => ({
                title: typeof d?.title === "string" ? d.title : "",
              }))
            : [],
        },
        t.province.fullName,
        tags,
      ),
      metadata: {
        title: t.title,
        provinceId: t.provinceId,
        tagIds: tags.map((tag) => tag.id),
        status: t.status,
        providerProfileId: t.providerProfileId,
      },
    };
  });
}

async function hotelDocs(): Promise<Doc[]> {
  const rows = await prisma.hotel.findMany({
    where: { status: "published", deletedAt: null },
    include: { province: true, rooms: true, tags: { include: { tag: true } } },
  });
  return rows.map((h) => {
    const tags = tagsOf(h);
    return {
      id: h.id,
      label: h.name,
      text: buildHotelEmbeddingText(h, h.province.fullName, tags),
      metadata: {
        name: h.name,
        provinceId: h.provinceId,
        tagIds: tags.map((tag) => tag.id),
        status: h.status,
        providerProfileId: h.providerProfileId,
      },
    };
  });
}

async function restaurantDocs(): Promise<Doc[]> {
  const rows = await prisma.restaurant.findMany({
    where: { status: "published", deletedAt: null },
    include: { province: true, tags: { include: { tag: true } } },
  });
  return rows.map((r) => {
    const tags = tagsOf(r);
    return {
      id: r.id,
      label: r.name,
      text: buildRestaurantEmbeddingText(
        { ...r, menu: parseMenu(r.menu) },
        r.province.fullName,
        tags,
      ),
      metadata: {
        name: r.name,
        provinceId: r.provinceId,
        tagIds: tags.map((tag) => tag.id),
        status: r.status,
        providerProfileId: r.providerProfileId,
      },
    };
  });
}

async function destinationDocs(): Promise<Doc[]> {
  const rows = await prisma.destination.findMany({
    include: { province: true, tags: { include: { tag: true } } },
  });
  return rows.map((d) => {
    const tags = tagsOf(d);
    return {
      id: d.id,
      label: d.name,
      text: buildDestinationEmbeddingText(d, d.province.fullName, tags),
      metadata: {
        name: d.name,
        provinceId: d.provinceId,
        tagIds: tags.map((tag) => tag.id),
        isPublished: d.isPublished,
      },
    };
  });
}

const SOURCES: Record<EmbeddingKind, () => Promise<Doc[]>> = {
  tour: tourDocs,
  hotel: hotelDocs,
  restaurant: restaurantDocs,
  destination: destinationDocs,
};

async function embedKind(kind: EmbeddingKind) {
  const docs = await SOURCES[kind]();
  const existing = FORCE
    ? new Map<string, number[]>()
    : await fetchVectors(kind, docs.map((d) => d.id));
  const missing = docs.filter((d) => !existing.has(d.id));
  console.log(`[${kind}] ${docs.length} mục, cần embed ${missing.length}`);

  let failed = 0;
  for (const [i, doc] of missing.entries()) {
    try {
      await upsertEmbedding(kind, doc.id, await embedText(doc.text), doc.metadata);
      console.log(`  ${i + 1}/${missing.length} ${doc.label}`);
    } catch (error) {
      failed++;
      console.error(`  ✗ ${doc.label}:`, error instanceof Error ? error.message : error);
    }
    await sleep(DELAY_MS);
  }
  return { total: docs.length, embedded: missing.length - failed, failed };
}

async function main() {
  const summary: Record<string, unknown> = {};
  for (const kind of Object.keys(SOURCES) as EmbeddingKind[]) {
    summary[kind] = await embedKind(kind);
  }
  console.table(summary);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
