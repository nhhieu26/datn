import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { buildChatTools } from "@/features/customer/chat/lib/ai-tools";
import { CHAT_INSTRUCTIONS, CHAT_MODEL } from "@/features/customer/chat/lib/prompt";
import { auth } from "@/lib/auth";
import { logTiming } from "@/lib/timing";
import { vertex } from "@/lib/vertex";

// Lập lộ trình: 3 tool tìm (web → Google Maps) chạy song song, rồi createTrip (chia ngày, xếp quán, tối ưu đường bộ)
export const maxDuration = 120;

export async function POST(req: Request) {
  const requestStart = performance.now();
  let llmCall = 0;
  const { messages }: { messages: UIMessage[] } = await req.json();
  const session = await auth();

  const result = streamText({
    model: vertex(CHAT_MODEL),
    instructions: CHAT_INSTRUCTIONS,
    tools: buildChatTools({ userId: session?.user?.id }),
    // Lập lộ trình cần 2 lượt tool + câu trả lời; chừa thêm bước cho chọn lại khi lựa chọn không hợp lệ
    stopWhen: isStepCount(10),
    messages: await convertToModelMessages(messages),
    // Đo thời gian: mỗi lượt AI suy nghĩ (kèm số token suy luận) và mỗi lần chạy tool
    onLanguageModelCallEnd: ({ performance: perf, usage, content }) => {
      llmCall += 1;
      const tools = content.flatMap((part) => (part.type === "tool-call" ? [part.toolName] : []));
      logTiming(
        `chat: AI lượt ${llmCall}`,
        perf.responseTimeMs,
        `vào ${usage.inputTokens ?? "?"} tok, ra ${usage.outputTokens ?? "?"} tok, suy luận ${usage.outputTokenDetails.reasoningTokens ?? 0} tok → ${tools.length ? tools.join(", ") : "trả lời"}`,
      );
    },
    onToolExecutionEnd: ({ toolCall, toolExecutionMs }) => {
      logTiming(`chat: tool ${toolCall.toolName}`, toolExecutionMs);
    },
    onEnd: () => {
      logTiming("chat: TỔNG lượt chat", performance.now() - requestStart, `${llmCall} lượt AI`);
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
