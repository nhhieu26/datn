import { type InferUITools, type ToolSet, type UIDataTypes, type UIMessage, tool } from "ai";
import { z } from "zod";
import { buildChatTools } from "@/features/customer/chat/lib/ai-tools";
import { getTripView, insertStop, moveStop, optimizeDays, removeStop } from "./trip-service";
import { MAX_TRIP_DAYS, type TripView } from "./types";

const KIND_LABEL = { hotel: "khách sạn", restaurant: "nhà hàng", destination: "điểm tham quan" } as const;

const minutes = (seconds: number) => Math.max(1, Math.round(seconds / 60));
const km = (meters: number) => (meters / 1000).toFixed(1);

// Tóm tắt trạng thái lộ trình cho AI (chỉ đọc từ CSDL, không lấy từ client)
function describeTrip(view: TripView): string {
  const days = view.days.map((d) => {
    const lines = d.stops.map(
      (s, i) => `  ${i + 1}. [stopId: ${s.id}] ${s.name} (${KIND_LABEL[s.kind]}${s.source === "external" ? ", ngoài Roamly" : ", Roamly"})`,
    );
    const base = d.baseHotel && d.baseHotel.day !== d.day ? `  Xuất phát/về: ${d.baseHotel.name}` : null;
    const route = d.route?.error
      ? "  (chưa tính được đường đi)"
      : d.route
        ? `  Tổng di chuyển: ${minutes(d.route.durationS)} phút, ${km(d.route.distanceM)} km`
        : null;
    return [`Ngày ${d.day}:`, base, ...(lines.length ? lines : ["  (chưa có điểm dừng)"]), route]
      .filter(Boolean)
      .join("\n");
  });
  return `Lộ trình "${view.title}"${view.province ? ` — ${view.province}` : ""}, ${view.dayCount} ngày:\n${days.join("\n")}`;
}

export function tripChatInstructions(view: TripView, canEdit: boolean): string {
  return `Bạn là Roamly AI, trợ lý chỉnh sửa lộ trình du lịch trên trang có bản đồ. Trả lời tiếng Việt, ngắn gọn (2–4 câu), thân thiện, dùng **in đậm** cho tên địa điểm; không dùng bảng.

TRẠNG THÁI LỘ TRÌNH HIỆN TẠI:
${describeTrip(view)}

QUY TẮC:
- Người dùng chỉ thêm được điểm dừng thông qua bạn (không có chức năng thêm tay); họ vẫn có thể kéo thả để đổi thứ tự/chuyển ngày và xóa điểm trên danh sách.
- Khi bạn thêm (\`addTripStops\`), hệ thống TỰ TỐI ƯU lại thứ tự đi của TOÀN BỘ lộ trình (tất cả các ngày, mỗi điểm vẫn giữ ngày của nó); khi chuyển ngày (\`moveTripStop\`), hệ thống tự tối ưu các ngày liên quan — theo thời gian di chuyển đường bộ thực tế (xuất phát và quay về khách sạn nếu có). Không tự sắp xếp hay tự tính khoảng cách; dùng số liệu ở trên.
- Thêm địa điểm mới — luôn gọi \`findPlaces\` trước (truyền \`province\` của lộ trình nếu người dùng không nói khác). \`source\`, \`kind\`, \`id\` (làm \`refId\`) và \`name\` phải chép đúng từ kết quả \`findPlaces\`, không bịa id.
  • Người dùng NÊU TÊN địa điểm cụ thể (vd: "thêm Hang Múa vào ngày 2") → gọi \`addTripStops\` ngay với kết quả khớp tên.
  • Người dùng CHỈ NÊU LOẠI/NHU CẦU, không nêu tên (vd: "thêm một quán ăn tối", "gợi ý điểm tham quan buổi chiều") → BẮT BUỘC gọi \`askUser\` với 3–5 kết quả phù hợp nhất chưa có trong lộ trình và \`day\` (ngày người dùng nói; không nói thì chọn ngày hợp lý nhất). KHÔNG gọi \`addTripStops\` trước khi người dùng chọn, không liệt kê lại danh sách bằng chữ.
  • Kết quả \`askUser\`: \`action: "add"\` → gọi \`addTripStops\` với đúng \`places\` và \`day\` trong kết quả; \`action: "more"\` → gọi \`findPlaces\` lại với truy vấn khác rồi \`askUser\` lại; \`action: "cancel"\` → xác nhận ngắn, không thêm gì.
- Xóa hoặc chuyển ngày: dùng \`removeTripStop\` / \`moveTripStop\` với \`stopId\` ở trên. Xóa không làm đổi thứ tự các điểm còn lại.
- Người dùng nhờ sắp xếp/tối ưu lại thứ tự đi: gọi \`optimizeTripDays\` với các ngày cần tối ưu (không nói ngày nào thì tối ưu tất cả các ngày có điểm dừng).
- Mỗi ngày tối đa 10 điểm dừng, lộ trình tối đa ${MAX_TRIP_DAYS} ngày. Người dùng có thể thêm ngày bằng nút "+" trên bản đồ.
- Sau khi chỉnh sửa, tóm tắt ngắn điều đã thay đổi; bản đồ bên trái tự cập nhật.
- Có thể dùng \`getWeather\` khi được hỏi thời tiết.
${canEdit ? "" : "- Người dùng hiện tại KHÔNG có quyền chỉnh sửa lộ trình này (chỉ chủ sở hữu được sửa): chỉ tư vấn, không thêm/xóa điểm.\n"}- Lịch sự từ chối yêu cầu không liên quan du lịch.`;
}

const placeSchema = z.object({
  source: z.enum(["internal", "external"]),
  kind: z.enum(["hotel", "restaurant", "destination"]),
  refId: z.string().min(1).describe("Trường `id` của địa điểm trong kết quả findPlaces."),
});

const namedPlaceSchema = placeSchema.extend({
  name: z.string().min(1).describe("Tên địa điểm, chép đúng từ kết quả findPlaces."),
});

/** Câu trả lời của người dùng cho `askUser` (client gửi về qua addToolOutput). */
export const stopPickSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("add"), day: z.number().int(), places: z.array(namedPlaceSchema) }),
  z.object({ action: z.literal("more") }),
  z.object({ action: z.literal("cancel") }),
]);
export type StopPick = z.infer<typeof stopPickSchema>;

function allTripTools(tripId: string) {
  const { findPlaces, getWeather } = buildChatTools();
  return {
    findPlaces,
    getWeather,
    // Không có execute: người dùng chọn trên giao diện, client trả kết quả qua addToolOutput
    askUser: tool({
      description:
        "Đưa danh sách địa điểm gợi ý (lấy từ kết quả findPlaces) để người dùng tick chọn một hoặc nhiều điểm thêm vào lộ trình. Dùng khi người dùng muốn thêm điểm dừng nhưng không nêu tên địa điểm cụ thể.",
      inputSchema: z.object({
        question: z.string().min(1).describe("Câu hỏi ngắn, vd: 'Bạn muốn thêm quán nào vào ngày 1?'"),
        day: z.number().int().min(1).max(MAX_TRIP_DAYS).describe("Ngày dự định thêm vào."),
        options: z
          .array(
            namedPlaceSchema.extend({
              reason: z.string().optional().describe("Một câu ngắn vì sao địa điểm phù hợp."),
            }),
          )
          .min(2)
          .max(5),
      }),
      outputSchema: stopPickSchema,
    }),
    addTripStops: tool({
      description:
        "Thêm một hoặc nhiều địa điểm (lấy từ kết quả findPlaces) vào một ngày của lộ trình; sau khi thêm, hệ thống tự tối ưu lại thứ tự đi của toàn bộ lộ trình (tất cả các ngày).",
      inputSchema: z.object({
        places: z.array(placeSchema).min(1).max(5),
        day: z.number().int().min(1).max(MAX_TRIP_DAYS).describe("Ngày cần thêm vào."),
      }),
      execute: async ({ places, day }) => {
        const added: string[] = [];
        const errors: string[] = [];
        for (const place of places) {
          try {
            added.push((await insertStop(tripId, place, day)).name);
          } catch (error) {
            errors.push(error instanceof Error ? error.message : "Không thêm được địa điểm.");
          }
        }
        let view = await getTripView(tripId);
        if (added.length > 0) {
          // Thêm xong → tối ưu lại thứ tự đi của toàn bộ lộ trình (mỗi điểm vẫn ở ngày của nó)
          try {
            view = await optimizeDays(tripId, view.days.map((d) => d.day));
          } catch (error) {
            console.warn("Không tối ưu được lộ trình sau khi thêm điểm:", error);
            errors.push("Đã thêm điểm nhưng chưa tối ưu lại được lộ trình.");
          }
        }
        return { added, errors, trip: describeTrip(view) };
      },
    }),
    removeTripStop: tool({
      description: "Xóa một điểm dừng khỏi lộ trình theo stopId.",
      inputSchema: z.object({ stopId: z.string().min(1) }),
      execute: async ({ stopId }) => {
        try {
          return { ok: true, trip: describeTrip(await removeStop(tripId, stopId)) };
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : "Không xóa được." };
        }
      },
    }),
    moveTripStop: tool({
      description: "Chuyển một điểm dừng sang ngày khác theo stopId; hệ thống tự tối ưu lại thứ tự các ngày liên quan.",
      inputSchema: z.object({
        stopId: z.string().min(1),
        day: z.number().int().min(1).max(MAX_TRIP_DAYS),
      }),
      execute: async ({ stopId, day }) => {
        try {
          return { ok: true, trip: describeTrip(await moveStop(tripId, stopId, day, { optimize: true })) };
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : "Không chuyển được." };
        }
      },
    }),
    optimizeTripDays: tool({
      description:
        "Tối ưu lại thứ tự điểm dừng của các ngày theo thời gian di chuyển đường bộ thực tế (chỉ khi người dùng yêu cầu sắp xếp/tối ưu).",
      inputSchema: z.object({
        days: z.array(z.number().int().min(1).max(MAX_TRIP_DAYS)).min(1).max(MAX_TRIP_DAYS),
      }),
      execute: async ({ days }) => {
        try {
          return { ok: true, trip: describeTrip(await optimizeDays(tripId, days)) };
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : "Không tối ưu được." };
        }
      },
    }),
  } satisfies ToolSet;
}

type TripTools = ReturnType<typeof allTripTools>;

/** Người không có quyền sửa chỉ được dùng tool tìm kiếm & thời tiết. */
export function buildTripChatTools({ tripId, canEdit }: { tripId: string; canEdit: boolean }): ToolSet {
  const tools = allTripTools(tripId);
  if (canEdit) return tools;
  const { findPlaces, getWeather } = tools;
  return { findPlaces, getWeather };
}

export type TripChatMessage = UIMessage<never, UIDataTypes, InferUITools<TripTools>>;
