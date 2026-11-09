import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { after } from "next/server";
import { CHAT_INSTRUCTIONS, CHAT_MODEL } from "@/features/customer/chat/lib/prompt";
import { chatTools } from "@/features/customer/chat/lib/tools";
import { auth } from "@/lib/auth";
import { flushTelemetry, withTrace } from "@/lib/telemetry";
import { vertex } from "@/lib/vertex";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { id, messages }: { id?: string; messages: UIMessage[] } = await req.json();
  const session = await auth().catch(() => null);
  const modelMessages = await convertToModelMessages(messages);

  const result = withTrace({ name: "chat", sessionId: id, userId: session?.user?.id, tags: ["chat"] }, () =>
    streamText({
      model: vertex(CHAT_MODEL),
      instructions: CHAT_INSTRUCTIONS,
      tools: chatTools,
      // Gọi tool → (tên trùng → askUser) → trả lời, chừa 1 bước dự phòng
      stopWhen: isStepCount(4),
      messages: modelMessages,
      telemetry: { functionId: "chat" },
    }),
  );

  // Chạy sau khi stream kết thúc: gửi span lên Langfuse trước khi function tắt
  after(flushTelemetry);

  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
}
