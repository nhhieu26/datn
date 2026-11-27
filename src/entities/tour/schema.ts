import { z } from "zod";

// Điểm tham quan provider chọn từ kết quả tìm kiếm Google Maps
export const tourStopSchema = z.object({
  placeId: z.string().trim().min(1).max(300),
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().max(300).nullable(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type TourStop = z.infer<typeof tourStopSchema>;

export const MAX_STOPS_PER_DAY = 10;

export const itineraryDaySchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tên chặng"),
  description: z.string().trim().min(1, "Vui lòng nhập mô tả chặng"),
  // Các điểm tham quan trong ngày, dùng để vẽ lộ trình Google Maps (không bắt buộc)
  stops: z
    .array(tourStopSchema)
    .max(MAX_STOPS_PER_DAY, `Tối đa ${MAX_STOPS_PER_DAY} điểm mỗi ngày`)
    .default([]),
  // Dữ liệu cũ dạng chữ ("Tràng An - Hang Múa"), chỉ giữ để tương thích
  location: z.string().trim().max(200, "Địa điểm tối đa 200 ký tự").default(""),
});

export const tourDepartureSchema = z.object({
  id: z.string().optional(),
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

// Khi sửa có thể không còn đợt nào chỉnh được (đã qua hoặc đã có người đặt)
export const updateTourSchema = createTourSchema.extend({
  departures: z.array(tourDepartureSchema),
});
