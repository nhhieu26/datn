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

// locatePlaces gọi Omkar (vài giây/truy vấn, song song) trước khi tổng hợp câu trả lời
export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: vertex(CHAT_MODEL),
    instructions: CHAT_INSTRUCTIONS,
    tools: chatTools,
    // Cho phép gọi kết hợp nhiều tool (nội bộ, rồi OpenStreetMap nếu thiếu, + thời tiết) rồi tổng hợp câu trả lời
    stopWhen: isStepCount(12),
    messages: await convertToModelMessages(messages),
    onStepFinish: ({ providerMetadata }) => {
      // Google Search chạy phía server Google, không có tool-call trong stream: log để biết model có thật sự search
      const grounding = providerMetadata?.vertex?.groundingMetadata as
        | { webSearchQueries?: string[] | null }
        | undefined;
      if (grounding?.webSearchQueries?.length) {
        console.info("[chat] google_search:", grounding.webSearchQueries);
      }
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
