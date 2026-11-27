import { prisma } from "@/lib/prisma";

/** Số lượt tìm kiếm gần nhất được giữ lại cho mỗi người dùng. */
export const SEARCH_HISTORY_LIMIT = 20;

/** Chuẩn hóa câu tìm kiếm để gộp các lượt giống nhau: trim, gộp khoảng trắng, chữ thường. */
export function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Ghi một lượt tìm kiếm. Câu đã có thì chỉ cập nhật thời gian (đưa lên đầu),
 * sau đó xóa các lượt cũ vượt quá SEARCH_HISTORY_LIMIT.
 */
export async function record(userId: string, query: string, embedding: number[]) {
  const normalized = normalizeQuery(query);
  if (!normalized) return;

  await prisma.$transaction(async (tx) => {
    await tx.searchHistory.upsert({
      where: { userId_query: { userId, query: normalized } },
      create: { userId, query: normalized, embedding },
      update: { embedding, updatedAt: new Date() },
    });
    const stale = await tx.searchHistory.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      skip: SEARCH_HISTORY_LIMIT,
      select: { id: true },
    });
    if (stale.length) {
      await tx.searchHistory.deleteMany({
        where: { id: { in: stale.map((s) => s.id) } },
      });
    }
  });
}

/** Danh sách hiển thị (không kèm vector). */
export function findRecentQueries(userId: string, take = SEARCH_HISTORY_LIMIT) {
  return prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take,
    select: { id: true, query: true },
  });
}

/** Vector các lượt tìm kiếm gần nhất, dùng dựng hồ sơ gợi ý. */
export async function findRecentEmbeddings(
  userId: string,
  take = SEARCH_HISTORY_LIMIT,
): Promise<number[][]> {
  const rows = await prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take,
    select: { embedding: true },
  });
  return rows.map((r) => r.embedding).filter((e) => e.length > 0);
}

/** Vector đã có của cùng một câu (ở bất kỳ người dùng nào) để khỏi gọi lại API embedding. */
export async function findEmbeddingByQuery(query: string): Promise<number[] | null> {
  const row = await prisma.searchHistory.findFirst({
    where: { query: normalizeQuery(query) },
    orderBy: { updatedAt: "desc" },
    select: { embedding: true },
  });
  return row?.embedding.length ? row.embedding : null;
}

export function remove(userId: string, id: string) {
  return prisma.searchHistory.deleteMany({ where: { id, userId } });
}

export function clear(userId: string) {
  return prisma.searchHistory.deleteMany({ where: { userId } });
}
