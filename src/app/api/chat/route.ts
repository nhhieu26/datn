import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { chatTools } from "@/features/customer/chat/lib/ai-tools";
import { CHAT_INSTRUCTIONS, CHAT_MODEL } from "@/features/customer/chat/lib/prompt";
import { vertex } from "@/lib/vertex";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: vertex(CHAT_MODEL),
    instructions: CHAT_INSTRUCTIONS,
    tools: chatTools,
    // findPlaces đã gom web + nội bộ + Google Maps; vẫn chừa bước cho tour, thời tiết rồi tổng hợp câu trả lời
    stopWhen: isStepCount(6),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
