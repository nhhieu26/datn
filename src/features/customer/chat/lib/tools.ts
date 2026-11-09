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
      options: z.array(z.string()).min(2).max(4).describe("2-4 câu trả lời gợi ý."),
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
      "Tìm khách sạn (hotel), nhà hàng (restaurant) hoặc điểm tham quan (destination) trên Google Maps, chỉ trong đúng khu vực `location`. Gọi song song nhiều lần nếu cần nhiều loại.",
    inputSchema: z.object({
      kind: z.enum(["hotel", "restaurant", "destination"]),
      keyword: z.string().min(1).describe("Chỉ nhu cầu, không kèm địa điểm, vd: 'lẩu gà', 'homestay view núi'."),
      location: z
        .string()
        .min(1)
        .describe("Địa danh đúng như người dùng nói, kèm tỉnh nếu họ có nêu, vd: 'Chí Linh' hoặc 'Chí Linh, Hải Dương'."),
    }),
    execute: async ({ kind, keyword, location }) => {
      try {
        return await searchPlaces(kind, keyword, location);
      } catch (error) {
        console.error("searchPlaces:", error);
        return { status: "ok" as const, area: location, places: [] };
      }
    },
  }),
};

export type ChatMessage = UIMessage<never, UIDataTypes, InferUITools<typeof chatTools>>;
