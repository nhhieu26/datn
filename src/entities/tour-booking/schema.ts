import { z } from "zod";

export const createTourBookingSchema = z.object({
  departureId: z.string().trim().min(1, "Vui lòng chọn ngày khởi hành"),
  guests: z.coerce.number().int().min(1, "Số khách tối thiểu là 1").max(100),
  contactName: z.string().trim().min(1, "Vui lòng nhập họ tên").max(100),
  contactEmail: z.string().trim().email("Email không hợp lệ").max(200),
  contactPhone: z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .pipe(z.string().regex(/^(\+84|0)\d{9,10}$/, "Số điện thoại không hợp lệ")),
  note: z.string().trim().max(1000).optional().default(""),
});
