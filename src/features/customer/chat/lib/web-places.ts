import { generateText } from "ai";
import { z } from "zod";
import { vertex } from "@/lib/vertex";
import { type Place, searchPlaces } from "./places";
import { CHAT_MODEL } from "./prompt";

type Kind = Place["kind"];
export type WebSource = { title: string; url: string };
export type WebPlace = Place & { reason: string };
export type WebPlaceResult =
  | { status: "ok"; area: string; places: WebPlace[]; sources: WebSource[] }
  | { status: "ambiguous"; options: string[] }
  | { status: "not_found" };

const MAX_CANDIDATES = 5;
const MAX_SOURCES = 4;
const TIMEOUT_MS = 25_000;

const KIND_LABEL: Record<Kind, string> = {
  hotel: "khách sạn/resort/homestay",
  restaurant: "nhà hàng/quán ăn/quán cà phê",
  destination: "điểm tham quan/danh thắng/khu vui chơi",
};

const candidatesSchema = z.array(z.object({ name: z.string().trim().min(2), reason: z.string().trim().default("") }));

// Grounding không đi kèm structured output → lấy mảng JSON đầu tiên trong văn bản trả về
function parseCandidates(text: string) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end <= start) return [];
  try {
    const parsed = candidatesSchema.safeParse(JSON.parse(text.slice(start, end + 1)));
    return parsed.success ? parsed.data.slice(0, MAX_CANDIDATES) : [];
  } catch {
    return [];
  }
}

/**
 * Tìm trên web (Google Search grounding) các địa điểm phù hợp yêu cầu, rồi tra từng tên trên
 * Google Maps trong đúng khu vực `location` để có tọa độ thật. Tên không tra được thì bỏ.
 */
export async function searchWebPlaces(kind: Kind, request: string, location: string): Promise<WebPlaceResult> {
  // Xác định khu vực trước: tên trùng/không có thì hỏi lại, không tốn lượt search web
  const probe = await searchPlaces(kind, KIND_LABEL[kind].split("/")[0], location);
  if (probe.status !== "ok") return probe;

  const prompt = `Dùng Google Search tìm các ${KIND_LABEL[kind]} CÓ THẬT, còn hoạt động tại "${probe.area}" phù hợp nhất với yêu cầu: "${request}".
Ưu tiên nơi được review tốt trên blog/báo du lịch. Tối đa ${MAX_CANDIDATES} nơi.
CHỈ trả về một mảng JSON, không giải thích, dạng:
[{"name": "tên riêng chính xác (không kèm địa chỉ)", "reason": "một câu ngắn vì sao phù hợp"}]`;

  const result = await generateText({
    model: vertex(CHAT_MODEL),
    tools: { google_search: vertex.tools.googleSearch({}) },
    prompt,
    abortSignal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const sources: WebSource[] = [];
  for (const s of result.sources) {
    if (s.sourceType !== "url" || sources.some((x) => x.url === s.url)) continue;
    sources.push({ title: s.title || s.url, url: s.url });
    if (sources.length >= MAX_SOURCES) break;
  }

  const found = await Promise.all(
    parseCandidates(result.text).map(async (c) => {
      const r = await searchPlaces(kind, c.name, location).catch(() => null);
      const place = r?.status === "ok" ? r.places[0] : undefined;
      return place ? { ...place, reason: c.reason } : null;
    }),
  );

  const places = found.filter((p): p is WebPlace => p != null);
  const unique = places.filter((p, i) => places.findIndex((q) => q.id === p.id) === i);
  return { status: "ok", area: probe.area, places: unique, sources };
}
