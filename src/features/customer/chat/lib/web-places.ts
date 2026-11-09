import { generateText, Output } from "ai";
import { z } from "zod";
import { vertex } from "@/lib/vertex";
import { type Place, searchPlaces } from "./places";
import { CHAT_MODEL } from "./prompt";

type Kind = Place["kind"];
export type WebPlace = Place & { reason: string };
export type WebPlaceResult =
  | { status: "ok"; area: string; places: WebPlace[] }
  | { status: "ambiguous"; options: string[] }
  | { status: "not_found" };

const MAX_CANDIDATES = 5;
const TIMEOUT_MS = 25_000;

const KIND_LABEL: Record<Kind, string> = {
  hotel: "khách sạn/resort/homestay",
  restaurant: "nhà hàng/quán ăn/quán cà phê",
  destination: "điểm tham quan/danh thắng/khu vui chơi",
};

const candidate = z.object({
  name: z.string().describe("Tên riêng chính xác của địa điểm, không kèm địa chỉ."),
  reason: z.string().describe("Một câu ngắn vì sao phù hợp với yêu cầu."),
});

/**
 * Tìm trên web (Google Search grounding) các địa điểm phù hợp yêu cầu, rồi tra từng tên trên
 * Google Maps trong đúng khu vực `location` để có tọa độ thật. Tên không tra được thì bỏ.
 */
export async function searchWebPlaces(kind: Kind, request: string, location: string): Promise<WebPlaceResult> {
  // Xác định khu vực trước: tên trùng/không có thì hỏi lại, không tốn lượt search web
  const probe = await searchPlaces(kind, KIND_LABEL[kind].split("/")[0], location);
  if (probe.status !== "ok") return probe;

  const prompt = `Dùng Google Search tìm các ${KIND_LABEL[kind]} CÓ THẬT, còn hoạt động tại "${probe.area}" phù hợp nhất với yêu cầu: "${request}".
Ưu tiên nơi được review tốt trên blog/báo du lịch. Tối đa ${MAX_CANDIDATES} nơi.`;

  // Gemini 3 cho dùng structured output cùng Google Search (nhưng không trả link nguồn)
  const { output } = await generateText({
    model: vertex(CHAT_MODEL),
    tools: { google_search: vertex.tools.googleSearch({}) },
    output: Output.array({ element: candidate }),
    prompt,
    abortSignal: AbortSignal.timeout(TIMEOUT_MS),
    telemetry: { functionId: "search-web" },
  });

  const found = await Promise.all(
    output.slice(0, MAX_CANDIDATES).map(async (c) => {
      const r = await searchPlaces(kind, c.name, location).catch(() => null);
      const place = r?.status === "ok" ? r.places[0] : undefined;
      return place ? { ...place, reason: c.reason } : null;
    }),
  );

  const places = found.filter((p): p is WebPlace => p != null);
  const unique = places.filter((p, i) => places.findIndex((q) => q.id === p.id) === i);
  return { status: "ok", area: probe.area, places: unique };
}
