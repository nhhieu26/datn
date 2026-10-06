import { z } from "zod";
import { todayIsoDate } from "@/lib/utils";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ")
  .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), "Ngày không hợp lệ");

export const createRestaurantBookingSchema = z
  .object({
    restaurantSlug: z.string().trim().min(1, "Vui lòng chọn nhà hàng"),
    date: isoDate,
    slot: z.string().regex(/^\d{2}:\d{2}$/, "Vui lòng chọn khung giờ"),
    guests: z.coerce.number().int().min(1, "Số khách tối thiểu là 1").max(100),
    contactName: z.string().trim().min(1, "Vui lòng nhập họ tên").max(100),
    contactEmail: z.string().trim().email("Email không hợp lệ").max(200),
    contactPhone: z
      .string()
      .transform((v) => v.replace(/\s/g, ""))
      .pipe(z.string().regex(/^(\+84|0)\d{9,10}$/, "Số điện thoại không hợp lệ")),
    note: z.string().trim().max(1000).optional().default(""),
  })
  .refine((v) => v.date >= todayIsoDate(), {
    path: ["date"],
    message: "Ngày đặt bàn không được ở quá khứ",
  });
