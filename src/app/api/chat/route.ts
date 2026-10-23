import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { chatTools } from "@/features/customer/chat/lib/ai-tools";
import { CHAT_INSTRUCTIONS, CHAT_MODEL } from "@/features/customer/chat/lib/prompt";

export const maxDuration = 30;

// Chatbot dùng key riêng; nếu chưa đặt thì provider tự dùng OPENROUTER_API_KEY
const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_CHAT_API_KEY });

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openrouter.chat(CHAT_MODEL),
    instructions: CHAT_INSTRUCTIONS,
    tools: chatTools,
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
