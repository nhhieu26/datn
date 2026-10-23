import {
  InferUITools,
  type UIMessage,
  type UIDataTypes,
  tool,
  type ToolSet,
} from "ai";
import { z } from "zod";

// Tool không có execute: model gọi để hỏi lại người dùng,
// câu trả lời do client gửi về qua addToolOutput
export const chatTools = {
  askUser: tool({
    description:
      "Hỏi lại người dùng khi câu hỏi hiện tại còn thiếu thông tin quan trọng (điểm đến, ngân sách, số người đi, sở thích...). Chỉ hỏi MỘT câu về MỘT thông tin duy nhất mỗi lần gọi. Chỉ dùng khi chưa thể đưa ra lời khuyên tốt.",
    inputSchema: z.object({
      question: z
        .string()
        .describe(
          "MỘT câu hỏi làm rõ ngắn gọn bằng tiếng Việt, chỉ về một thông tin.",
        ),
      options: z
        .array(z.string())
        .length(3)
        .describe(
          "ĐÚNG 3 câu trả lời cụ thể cho đúng câu hỏi trên, để người dùng bấm chọn.",
        ),
    }),
  }),
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof chatTools>;

export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;
