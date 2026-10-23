import { createVertex } from "@ai-sdk/google-vertex";
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

export const maxDuration = 30;

// Vertex express mode: xác thực bằng API key, không cần project/location/ADC
const vertex = createVertex({ apiKey: process.env.GOOGLE_VERTEX_API_KEY });

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: vertex(CHAT_MODEL),
    instructions: CHAT_INSTRUCTIONS,
    tools: chatTools,
    // Cho model chạy tiếp sau khi tool tìm kiếm trả kết quả để viết câu trả lời
    stopWhen: isStepCount(5),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
