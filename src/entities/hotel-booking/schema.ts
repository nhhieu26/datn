import { z } from "zod";
import { todayIsoDate } from "@/lib/utils";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ")
  .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), "Ngày không hợp lệ");

export const createHotelBookingSchema = z
  .object({
    roomId: z.string().trim().min(1, "Vui lòng chọn phòng"),
    checkIn: isoDate,
    checkOut: isoDate,
    rooms: z.coerce.number().int().min(1, "Số phòng tối thiểu là 1").max(20),
    guests: z.coerce.number().int().min(1, "Số khách tối thiểu là 1").max(100),
    contactName: z.string().trim().min(1, "Vui lòng nhập họ tên").max(100),
    contactEmail: z.string().trim().email("Email không hợp lệ").max(200),
    contactPhone: z
      .string()
      .transform((v) => v.replace(/\s/g, ""))
      .pipe(z.string().regex(/^(\+84|0)\d{9,10}$/, "Số điện thoại không hợp lệ")),
    note: z.string().trim().max(1000).optional().default(""),
  })
  .refine((v) => v.checkIn >= todayIsoDate(), {
    path: ["checkIn"],
    message: "Ngày nhận phòng không được ở quá khứ",
  })
  .refine((v) => v.checkOut > v.checkIn, {
    path: ["checkOut"],
    message: "Ngày trả phòng phải sau ngày nhận phòng",
  });
