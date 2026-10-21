import { createGoogle } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { CHAT_INSTRUCTIONS, CHAT_MODEL } from "@/features/customer/chat/lib/prompt";

export const maxDuration = 30;

// Chatbot dùng key riêng; nếu chưa đặt thì AI SDK tự dùng GOOGLE_GENERATIVE_AI_API_KEY
const google = createGoogle({ apiKey: process.env.GOOGLE_CHAT_API_KEY });

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google(CHAT_MODEL),
    instructions: CHAT_INSTRUCTIONS,
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
