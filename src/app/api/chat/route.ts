import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { CHAT_INSTRUCTIONS, CHAT_MODEL } from "@/features/customer/chat/lib/prompt";

export const maxDuration = 30;

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
