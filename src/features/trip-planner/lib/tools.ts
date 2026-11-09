import { type InferUITools, tool, type UIDataTypes, type UIMessage } from "ai";
import { z } from "zod";
import { searchPlaces } from "@/features/customer/chat/lib/places";
import { searchWebPlaces } from "@/features/customer/chat/lib/web-places";
import { buildItinerary } from "./build";
import type { TravelMode } from "./itinerary";

const KIND = z.enum(["hotel", "restaurant", "destination"]);
const TIME = z.string().regex(/^\d{1,2}:\d{2}$/, "Dạng HH:mm");
const LOCATION = z
  .string()
  .min(1)
  .describe("Địa danh đúng như người dùng nói, kèm tỉnh nếu họ có nêu, vd: 'Tràng An' hoặc 'Chí Linh, Hải Dương'.");

// Rút gọn kết quả tìm kiếm gửi lại cho model (bỏ ảnh, link...) để tiết kiệm token
const compactPlace = (p: { id: string; name: string; kind: string; type: string; address: string; rating: number | null; reviewCount: number | null; openingHours: string | null }) => ({
  placeId: p.id,
  name: p.name,
  kind: p.kind,
  type: p.type,
  address: p.address,
  rating: p.rating,
  reviewCount: p.reviewCount,
  openingHours: p.openingHours,
});

export function createTripTools(mode: TravelMode) {
  return {
    // Không có execute: client hiển thị câu hỏi và gửi câu trả lời qua addToolOutput
    askUser: tool({
      description: "Hỏi lại người dùng MỘT câu khi còn thiếu thông tin để lập lộ trình.",
      inputSchema: z.object({
        question: z.string(),
        options: z.array(z.string()).min(2).max(4).describe("2-4 câu trả lời gợi ý."),
      }),
      outputSchema: z.string(),
    }),

    searchPlaces: tool({
      description:
        "Tìm khách sạn (hotel), nhà hàng (restaurant) hoặc điểm tham quan (destination) trên Google Maps trong khu vực `location`. Kết quả có placeId để dùng trong setItinerary.",
      inputSchema: z.object({
        kind: KIND,
        keyword: z.string().min(1).describe("Chỉ nhu cầu, không kèm địa điểm, vd: 'dê núi', 'homestay view núi'."),
        location: LOCATION,
      }),
      execute: async ({ kind, keyword, location }) => {
        try {
          return await searchPlaces(kind, keyword, location);
        } catch (error) {
          console.error("searchPlaces:", error);
          return { status: "error" as const, message: "Không tìm được địa điểm, hãy thử lại." };
        }
      },
      toModelOutput: ({ output }) => ({
        type: "json",
        value: output.status === "ok" ? { ...output, places: output.places.map(compactPlace) } : output,
      }),
    }),

    searchWeb: tool({
      description:
        "Tìm trên web (blog, báo, review) các địa điểm theo yêu cầu đặc biệt của người dùng rồi tra trên Google Maps. Dùng khi người dùng muốn 'tìm trên mạng', 'theo review', nơi nổi tiếng/được khen, hoặc searchPlaces không ra kết quả phù hợp.",
      inputSchema: z.object({
        kind: KIND,
        request: z.string().min(1).describe("Yêu cầu của người dùng, vd: 'quán cà phê view lúa đẹp để chụp ảnh'."),
        location: LOCATION,
      }),
      execute: async ({ kind, request, location }) => {
        try {
          return await searchWebPlaces(kind, request, location);
        } catch (error) {
          console.error("searchWeb:", error);
          return { status: "error" as const, message: "Tìm trên web thất bại, hãy dùng searchPlaces." };
        }
      },
      toModelOutput: ({ output }) => ({
        type: "json",
        value:
          output.status === "ok"
            ? {
                ...output,
                places: output.places.map((p) => ({ ...compactPlace(p), reason: p.reason })),
              }
            : output,
      }),
    }),

    setItinerary: tool({
      description:
        "Tạo mới hoặc thay toàn bộ lộ trình đang hiển thị. Luôn gửi ĐẦY ĐỦ các ngày và điểm dừng (kể cả phần giữ nguyên). Server kiểm tra quy tắc bữa ăn, tối ưu thứ tự điểm tham quan và tính quãng đường thực tế.",
      inputSchema: z.object({
        title: z.string().min(1).describe("Tên ngắn, vd: 'Ninh Bình 2 ngày 1 đêm'."),
        days: z
          .array(
            z.object({
              date: z.string().optional().describe("Ngày đi dạng YYYY-MM-DD nếu người dùng có nêu."),
              start: TIME.describe("Giờ bắt đầu ngày, vd 07:00."),
              end: TIME.describe("Giờ kết thúc ngày, vd 21:30."),
              stops: z
                .array(
                  z.object({
                    placeId: z.string().describe("placeId lấy từ kết quả searchPlaces/searchWeb."),
                    slot: z
                      .enum(["hotel", "breakfast", "lunch", "dinner", "visit"])
                      .describe("hotel: nghỉ/nhận/trả phòng; breakfast/lunch/dinner: bữa ăn; visit: tham quan, cà phê."),
                    time: TIME.describe("Giờ đến dự kiến."),
                    durationMin: z.number().int().min(0).max(720).describe("Thời gian ở lại (phút)."),
                    note: z.string().optional().describe("Ghi chú ngắn: món nên thử, hoạt động..."),
                  }),
                )
                .min(1),
            }),
          )
          .min(1)
          .max(7),
      }),
      execute: async (input) => {
        try {
          return await buildItinerary(input, mode, { strict: true });
        } catch (error) {
          console.error("setItinerary:", error);
          return { status: "error" as const, message: "Không dựng được lộ trình, hãy thử lại." };
        }
      },
      // Model chỉ cần biết kết quả, không cần polyline/ảnh
      toModelOutput: ({ output }) => ({
        type: "json",
        value:
          output.status === "ok"
            ? {
                status: "ok",
                warnings: output.warnings,
                days: output.itinerary.days.map((d, i) => ({
                  day: i + 1,
                  stops: d.stops.map((s) => `${s.time} ${s.slot} ${s.place.name}`),
                  totalKm: Math.round(d.legs.reduce((sum, l) => sum + (l?.distanceM ?? 0), 0) / 100) / 10,
                })),
              }
            : output,
      }),
    }),
  };
}

export type TripTools = ReturnType<typeof createTripTools>;
export type TripChatMessage = UIMessage<never, UIDataTypes, InferUITools<TripTools>>;
