import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const menuItemDraftSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên món").max(200),
  description: z
    .string()
    .trim()
    .max(2000, "Mô tả món tối đa 2000 ký tự")
    .default(""),
  price: z.coerce.number().min(0, "Giá không được âm"),
});

export const timeSlotDraftSchema = z
  .object({
    startTime: z.string().regex(timePattern, "Giờ bắt đầu không hợp lệ"),
    endTime: z.string().regex(timePattern, "Giờ kết thúc không hợp lệ"),
  })
  .refine((slot) => slot.startTime < slot.endTime, {
    message: "Giờ kết thúc phải sau giờ bắt đầu",
    path: ["endTime"],
  });

export const createRestaurantSchema = z
  .object({
    name: z.string().trim().min(1, "Vui lòng nhập tên nhà hàng").max(200),
    provinceId: z.string().trim().min(1, "Vui lòng chọn tỉnh/thành"),
    address: z.string().trim().min(1, "Vui lòng nhập địa chỉ").max(500),
    phone: z
      .string()
      .trim()
      .max(20, "Số điện thoại tối đa 20 ký tự")
      .transform((value) => value || null),
    capacity: z.coerce.number().int().positive("Sức chứa phải lớn hơn 0"),
    description: z
      .string()
      .trim()
      .max(2000, "Mô tả tối đa 2000 ký tự")
      .transform((value) => value || null),
    tagIds: z.array(z.string()).default([]),
    menu: z.array(menuItemDraftSchema).min(1, "Cần ít nhất 1 món"),
    timeSlots: z.array(timeSlotDraftSchema).min(1, "Cần ít nhất 1 khung giờ"),
  })
  .refine(
    (data) =>
      new Set(data.timeSlots.map((slot) => slot.startTime)).size ===
      data.timeSlots.length,
    {
      message: "Các khung giờ bắt đầu không được trùng nhau",
      path: ["timeSlots"],
    }
  );
