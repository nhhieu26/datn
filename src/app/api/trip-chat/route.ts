import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import type { Itinerary } from "@/features/trip-planner/lib/itinerary";
import { TRIP_MODEL, tripInstructions } from "@/features/trip-planner/lib/prompt";
import { createTripTools } from "@/features/trip-planner/lib/tools";
import { travelModeSchema } from "@/features/trip-planner/lib/schema";
import { vertex } from "@/lib/vertex";

export const maxDuration = 120;

export async function POST(req: Request) {
  const body: { messages: UIMessage[]; itinerary?: Itinerary | null; mode?: unknown } = await req.json();
  const mode = travelModeSchema.catch("car").parse(body.mode);
  const tools = createTripTools(mode);

  let instructions: string;
  try {
    instructions = tripInstructions(body.itinerary ?? null, mode);
  } catch {
    // Lộ trình gửi lên sai cấu trúc → coi như chưa có
    instructions = tripInstructions(null, mode);
  }

  const result = streamText({
    model: vertex(TRIP_MODEL),
    instructions,
    tools,
    // Tìm nhiều loại địa điểm → setItinerary → (sửa lỗi → setItinerary) → trả lời
    stopWhen: isStepCount(10),
    messages: await convertToModelMessages(body.messages, { tools }),
  });

  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
}
