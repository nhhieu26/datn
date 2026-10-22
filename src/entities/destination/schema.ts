import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function coordinate(min: number, max: number, message: string) {
  return z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined
        ? undefined
        : Number(value),
    z
      .number({ error: message })
      .min(min, "Toạ độ không hợp lệ")
      .max(max, "Toạ độ không hợp lệ"),
  );
}

export const createDestinationSchema = z
  .object({
    name: z.string().trim().min(1, "Vui lòng nhập tên địa điểm").max(200),
    provinceId: z.string().trim().min(1, "Vui lòng chọn tỉnh/thành"),
    address: z.string().trim().min(1, "Vui lòng nhập địa chỉ").max(500),
    description: z
      .string()
      .trim()
      .max(2000, "Mô tả tối đa 2000 ký tự")
      .default(""),
    latitude: coordinate(-90, 90, "Vui lòng chọn vị trí trên bản đồ"),
    longitude: coordinate(-180, 180, "Vui lòng chọn vị trí trên bản đồ"),
    openTime: z.string().regex(timePattern, "Giờ mở cửa không hợp lệ"),
    closeTime: z.string().regex(timePattern, "Giờ đóng cửa không hợp lệ"),
    ticketPrice: z.preprocess(
      (value) =>
        value === "" || value === null || value === undefined
          ? null
          : Number(value),
      z
        .number({ error: "Giá vé không hợp lệ" })
        .positive("Giá vé phải lớn hơn 0")
        .nullable(),
    ),
    isPublished: z.preprocess(
      (value) => value === true || value === "true",
      z.boolean().default(true),
    ),
    tagIds: z.array(z.string()).default([]),
  })
  .refine((d) => d.openTime < d.closeTime, {
    path: ["closeTime"],
    message: "Giờ đóng cửa phải sau giờ mở cửa",
  });
