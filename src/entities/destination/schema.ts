import { z } from "zod";

function nullableCoordinate(min: number, max: number) {
  return z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined
        ? null
        : Number(value),
    z
      .number()
      .min(min, "Toạ độ không hợp lệ")
      .max(max, "Toạ độ không hợp lệ")
      .nullable()
  );
}

export const createDestinationSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên địa điểm").max(200),
  provinceId: z.string().trim().min(1, "Vui lòng chọn tỉnh/thành"),
  address: z.string().trim().min(1, "Vui lòng nhập địa chỉ").max(500),
  description: z
    .string()
    .trim()
    .max(2000, "Mô tả tối đa 2000 ký tự")
    .default(""),
  latitude: nullableCoordinate(-90, 90),
  longitude: nullableCoordinate(-180, 180),
  ticketPrice: z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined
        ? null
        : Number(value),
    z
      .number({ error: "Giá vé không hợp lệ" })
      .positive("Giá vé phải lớn hơn 0")
      .nullable()
  ),
  isPublished: z.preprocess(
    (value) => value === true || value === "true",
    z.boolean().default(true)
  ),
  tagIds: z.array(z.string()).default([]),
});
