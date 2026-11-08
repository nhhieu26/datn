import { generateText } from "ai";
import { z } from "zod";
import { vertex } from "@/lib/vertex";
import { CHAT_MODEL, LOW_THINKING } from "./prompt";

export type PlaceKind = "hotel" | "restaurant" | "destination";

export type WebCandidate = { name: string; kind: PlaceKind; reason: string };
export type WebSource = { title: string; url: string };

const MAX_CANDIDATES = 8;
// Lộ trình nhiều ngày (không dùng dữ liệu nội bộ) cần nhiều ứng viên hơn
const MAX_CANDIDATES_LIMIT = 20;
const MAX_SOURCES = 5;
const WEB_SEARCH_TIMEOUT_MS = 20_000;

const KIND_LABEL: Record<PlaceKind, string> = {
  hotel: "khách sạn/resort/homestay (kind: hotel)",
  restaurant: "nhà hàng/quán ăn (kind: restaurant)",
  destination: "điểm tham quan/danh thắng (kind: destination)",
};

const candidateSchema = z.object({
  name: z.string().trim().min(2),
  kind: z.enum(["hotel", "restaurant", "destination"]),
  reason: z.string().trim().default(""),
});

// Grounding không đi kèm structured output → lấy mảng JSON đầu tiên trong văn bản trả về
function parseCandidates(
  text: string,
  kinds: PlaceKind[],
  maxCandidates: number,
): WebCandidate[] {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end <= start) return [];

  let raw: unknown;
  try {
    raw = JSON.parse(text.slice(start, end + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const result: WebCandidate[] = [];
  for (const item of raw) {
    const parsed = candidateSchema.safeParse(item);
    if (!parsed.success || !kinds.includes(parsed.data.kind)) continue;
    const key = `${parsed.data.kind}|${parsed.data.name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(parsed.data);
  }
  return result.slice(0, maxCandidates);
}

/**
 * Tìm trên web (Google Search grounding của Gemini) các địa điểm có thật phù hợp yêu cầu.
 * Lỗi hoặc không có kết quả → trả về rỗng để pipeline vẫn chạy với dữ liệu nội bộ.
 */
export async function searchWebPlaces({
  request,
  province,
  kinds,
  criteria,
  maxCandidates = MAX_CANDIDATES,
  timeoutMs = WEB_SEARCH_TIMEOUT_MS,
}: {
  request: string;
  province?: string;
  kinds: PlaceKind[];
  // Tiêu chí chọn do AI suy ra từ yêu cầu; bỏ trống → ưu tiên nổi tiếng, đánh giá tốt
  criteria?: string;
  maxCandidates?: number;
  timeoutMs?: number;
}): Promise<{ candidates: WebCandidate[]; sources: WebSource[] }> {
  const max = Math.min(Math.max(1, maxCandidates), MAX_CANDIDATES_LIMIT);
  const prompt = `Dùng Google Search để tìm các địa điểm CÓ THẬT tại Việt Nam phù hợp nhất với yêu cầu du lịch sau.

Yêu cầu của khách: "${request}"
${province ? `Khu vực: ${province}` : ""}
Loại địa điểm cần tìm: ${kinds.map((k) => KIND_LABEL[k]).join("; ")}

${criteria?.trim() ? `Tiêu chí chọn: ${criteria.trim()}. Chỉ chọn địa điểm còn hoạt động.` : "Ưu tiên địa điểm nổi tiếng, được đánh giá tốt, còn hoạt động."}
Tối đa ${max} địa điểm, chia đều giữa các loại.
CHỈ trả về một mảng JSON, không kèm giải thích, theo dạng:
[{"name": "tên riêng chính xác của địa điểm (tiếng Việt, không kèm địa chỉ)", "kind": "hotel|restaurant|destination", "reason": "một câu ngắn vì sao phù hợp"}]`;

  try {
    const result = await generateText({
      model: vertex(CHAT_MODEL),
      tools: { google_search: vertex.tools.googleSearch({}) },
      providerOptions: LOW_THINKING,
      prompt,
      abortSignal: AbortSignal.timeout(timeoutMs),
    });

    const seenUrls = new Set<string>();
    const sources: WebSource[] = [];
    for (const source of result.sources) {
      if (source.sourceType !== "url" || seenUrls.has(source.url)) continue;
      seenUrls.add(source.url);
      sources.push({ title: source.title || source.url, url: source.url });
      if (sources.length >= MAX_SOURCES) break;
    }

    return { candidates: parseCandidates(result.text, kinds, max), sources };
  } catch (error) {
    console.warn("Tìm kiếm web (Google Search grounding) thất bại:", error);
    return { candidates: [], sources: [] };
  }
}
