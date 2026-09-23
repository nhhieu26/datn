import { z } from "zod";

export const itineraryDaySchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tên chặng"),
  description: z.string().trim().min(1, "Vui lòng nhập mô tả chặng"),
});

export const tourDepartureSchema = z.object({
  departureDate: z.coerce.date({ message: "Ngày khởi hành không hợp lệ" }),
  returnDate: z.coerce.date().nullable(),
  price: z.coerce.number().positive().nullable(),
  totalSlots: z.coerce.number().int().positive("Tổng chỗ phải lớn hơn 0"),
});

export const createTourSchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tiêu đề tour").max(200),
  provinceId: z.string().trim().min(1, "Vui lòng chọn tỉnh/thành"),
  tagIds: z.array(z.string()).default([]),
  durationDays: z.coerce.number().int().min(1, "Số ngày tối thiểu là 1"),
  durationNights: z.coerce.number().int().min(0),
  description: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mô tả")
    .max(2000, "Mô tả tối đa 2000 ký tự"),
  includeServices: z.array(z.string()).default([]),
  excludeServices: z.array(z.string()).default([]),
  itinerary: z
    .array(itineraryDaySchema)
    .min(1, "Cần ít nhất 1 ngày lịch trình"),
  basePrice: z.coerce.number().positive("Giá phải lớn hơn 0"),
  departures: z
    .array(tourDepartureSchema)
    .min(1, "Cần ít nhất 1 đợt khởi hành"),
});
