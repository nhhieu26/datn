import { z } from "zod";

export const createReviewSchema = z.object({
  kind: z.enum(["tour", "hotel", "restaurant"]),
  bookingCode: z.string().trim().min(1, "Vui lòng chọn đơn đặt"),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Vui lòng chọn số sao")
    .max(5, "Tối đa 5 sao"),
  content: z
    .string()
    .trim()
    .min(10, "Nội dung đánh giá cần ít nhất 10 ký tự")
    .max(1000, "Nội dung đánh giá tối đa 1000 ký tự"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
