import { normalizeQuery, searchHistoryRepo } from "@/entities/search-history";
import { embedText } from "@/lib/gemini";
import { queryScored } from "@/lib/pinecone";
import type { ExploreKind } from "../data";

/** Số mục ngữ nghĩa gần nhất lấy về cho mỗi loại. */
const SEMANTIC_TOP_K = 50;
/**
 * Điểm cosine tuyệt đối của gemini-embedding-001 dao động theo từng câu (mục đúng nhu cầu
 * có khi 0.60, có khi 0.71) nên dùng ngưỡng tương đối: giữ mục có điểm ≥ điểm cao nhất − MARGIN,
 * và không thấp hơn FLOOR. Đo trên dữ liệu hiện tại, vd "hải sản tươi" chỉ còn nhà hàng hải sản,
 * "chùa cổ tâm linh" còn tour Bái Đính + các chùa.
 */
const SEMANTIC_MARGIN = 0.07;
// câu không có mục nào thật sự liên quan (vd tên riêng không có trong hệ thống) có điểm cao nhất
// chỉ ~0.58, còn mục đúng nhu cầu thấp nhất đo được ~0.60
const SEMANTIC_FLOOR = 0.6;

export type SemanticScores = Record<ExploreKind, Map<string, number>>;

const ALL_KINDS: ExploreKind[] = ["tour", "hotel", "restaurant", "destination"];

/** Vector của câu tìm kiếm; dùng lại vector đã lưu trong lịch sử nếu câu này từng được tìm. */
export async function getQueryEmbedding(q: string): Promise<number[] | null> {
  const query = normalizeQuery(q);
  if (!query) return null;
  // tra cache lỗi thì vẫn embed bình thường
  const cached = await searchHistoryRepo
    .findEmbeddingByQuery(query)
    .catch((error) => {
      console.error("findEmbeddingByQuery:", error);
      return null;
    });
  if (cached) return cached;
  try {
    return await embedText(query);
  } catch (error) {
    console.error("getQueryEmbedding:", error);
    return null;
  }
}

/**
 * Điểm cosine theo từng loại; null khi Pinecone lỗi (khi đó chỉ tìm theo từ khóa).
 * Luôn truy vấn cả 4 loại để lấy điểm cao nhất chung: lọc riêng một loại không liên quan
 * (vd "hải sản" trong tab Khách sạn) sẽ không bị lấp đầy bằng mục kém phù hợp.
 */
export async function semanticScores(
  vector: number[],
): Promise<SemanticScores | null> {
  try {
    const results = await Promise.all(
      ALL_KINDS.map((kind) => queryScored(kind, vector, SEMANTIC_TOP_K)),
    );
    const best = Math.max(0, ...results.flat().map((m) => m.score));
    const threshold = Math.max(SEMANTIC_FLOOR, best - SEMANTIC_MARGIN);
    return Object.fromEntries(
      ALL_KINDS.map((kind, i) => [
        kind,
        new Map(
          results[i]
            .filter((m) => m.score >= threshold)
            .map((m) => [m.id, m.score]),
        ),
      ]),
    ) as SemanticScores;
  } catch (error) {
    console.error("semanticScores:", error);
    return null;
  }
}
