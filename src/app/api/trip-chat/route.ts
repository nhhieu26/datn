import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { after } from "next/server";
import type { Itinerary } from "@/features/trip-planner/lib/itinerary";
import { TRIP_MODEL, tripInstructions } from "@/features/trip-planner/lib/prompt";
import { travelModeSchema } from "@/features/trip-planner/lib/schema";
import { createTripTools } from "@/features/trip-planner/lib/tools";
import { auth } from "@/lib/auth";
import { flushTelemetry, withTrace } from "@/lib/telemetry";
import { vertex } from "@/lib/vertex";

export const maxDuration = 120;

export async function POST(req: Request) {
  const body: { id?: string; messages: UIMessage[]; itinerary?: Itinerary | null; mode?: unknown } =
    await req.json();
  const mode = travelModeSchema.catch("car").parse(body.mode);
  const tools = createTripTools(mode);
  const session = await auth().catch(() => null);

  let instructions: string;
  try {
    instructions = tripInstructions(body.itinerary ?? null, mode);
  } catch {
    // Lộ trình gửi lên sai cấu trúc → coi như chưa có
    instructions = tripInstructions(null, mode);
  }
  const messages = await convertToModelMessages(body.messages, { tools });

  // sessionId = id lộ trình (useChat dùng id của trip) → mọi lượt chat của một lộ trình chung một session
  const result = withTrace(
    {
      name: "trip-chat",
      sessionId: body.id,
      userId: session?.user?.id,
      tags: ["trip-planner"],
      metadata: { mode, hasItinerary: String(Boolean(body.itinerary)) },
    },
    () =>
      streamText({
        model: vertex(TRIP_MODEL),
        instructions,
        tools,
        // Tìm nhiều loại địa điểm → setItinerary → (sửa lỗi → setItinerary) → trả lời
        stopWhen: isStepCount(10),
        messages,
        telemetry: { functionId: "trip-chat" },
      }),
  );

  // Chạy sau khi stream kết thúc: gửi span lên Langfuse trước khi function tắt
  after(flushTelemetry);

  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
}
