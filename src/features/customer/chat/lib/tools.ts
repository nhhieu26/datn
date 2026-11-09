import { type InferUITools, tool, type UIDataTypes, type UIMessage } from "ai";
import { z } from "zod";
import { searchPlaces } from "./places";
import { searchTours } from "./tours";

export const chatTools = {
  // Không có execute: client hiển thị câu hỏi và gửi câu trả lời qua addToolOutput
  askUser: tool({
    description: "Hỏi lại người dùng MỘT câu khi yêu cầu quá mơ hồ để tìm kiếm.",
    inputSchema: z.object({
      question: z.string(),
      options: z.array(z.string()).length(3).describe("Đúng 3 câu trả lời gợi ý."),
    }),
    outputSchema: z.string(),
  }),

  searchTours: tool({
    description: "Tìm tour du lịch đang bán trên Roamly.",
    inputSchema: z.object({
      query: z.string().describe("Nhu cầu bằng tiếng Việt, vd: 'đi thuyền ngắm vịnh Lan Hạ'."),
      province: z.string().optional().describe("Tỉnh/thành, vd: Ninh Bình."),
      maxPrice: z.number().positive().optional().describe("Giá tối đa (VND)."),
      days: z.number().int().positive().optional().describe("Số ngày."),
    }),
    execute: (input) => searchTours(input),
  }),

  searchPlaces: tool({
    description:
      "Tìm khách sạn (hotel), nhà hàng (restaurant) hoặc điểm tham quan (destination) trên Google Maps. Gọi song song nhiều lần nếu cần nhiều loại.",
    inputSchema: z.object({
      kind: z.enum(["hotel", "restaurant", "destination"]),
      query: z
        .string()
        .min(1)
        .describe("Câu tìm Google Maps: nhu cầu + 'ở' + địa điểm cụ thể + tỉnh, vd: 'quán lẩu ngon ở Chí Linh, Hải Dương, Việt Nam'."),
    }),
    execute: async ({ kind, query }) => {
      try {
        return await searchPlaces(kind, query);
      } catch (error) {
        console.error("searchPlaces:", error);
        return [];
      }
    },
  }),
};

export type ChatMessage = UIMessage<never, UIDataTypes, InferUITools<typeof chatTools>>;
