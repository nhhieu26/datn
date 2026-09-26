import { z } from "zod";

export const roomDraftSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên loại phòng").max(200),
  description: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mô tả phòng")
    .max(2000, "Mô tả tối đa 2000 ký tự"),
  capacity: z.coerce.number().int().positive("Sức chứa phải lớn hơn 0"),
  quantity: z.coerce.number().int().positive("Số lượng phòng phải lớn hơn 0"),
  basePrice: z.coerce.number().positive("Giá phải lớn hơn 0"),
  amenities: z.array(z.string()).default([]),
});

export const createHotelSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên khách sạn").max(200),
  provinceId: z.string().trim().min(1, "Vui lòng chọn tỉnh/thành"),
  address: z.string().trim().min(1, "Vui lòng nhập địa chỉ").max(500),
  description: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mô tả")
    .max(2000, "Mô tả tối đa 2000 ký tự"),
  amenities: z.array(z.string()).default([]),
  rooms: z.array(roomDraftSchema).min(1, "Cần ít nhất 1 loại phòng"),
});
