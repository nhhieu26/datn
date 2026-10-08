import { z } from "zod";

/** Provider chuyển trạng thái đơn đặt bàn: xác nhận, hoàn thành hoặc hủy. */
export const updateRestaurantBookingStatusSchema = z.discriminatedUnion("status", [
  z.object({ code: z.string().min(1), status: z.literal("confirmed") }),
  z.object({ code: z.string().min(1), status: z.literal("completed") }),
  z.object({
    code: z.string().min(1),
    status: z.literal("cancelled"),
    reason: z
      .string()
      .trim()
      .min(5, "Lý do hủy cần ít nhất 5 ký tự.")
      .max(500, "Lý do hủy tối đa 500 ký tự."),
  }),
]);
