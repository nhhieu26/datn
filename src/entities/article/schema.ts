import { z } from "zod";

export const ARTICLE_CATEGORIES = [
  "guide",
  "destination",
  "food",
  "experience",
  "news",
] as const;

export const articleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tiêu đề")
    .max(200, "Tiêu đề tối đa 200 ký tự"),
  excerpt: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tóm tắt")
    .max(400, "Tóm tắt tối đa 400 ký tự"),
  content: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập nội dung bài viết")
    .max(200_000, "Nội dung quá dài"),
  category: z.enum(ARTICLE_CATEGORIES, { error: "Vui lòng chọn danh mục" }),
  status: z.enum(["draft", "published"]).default("draft"),
  provinceId: z.preprocess(
    (value) => (value === "" || value == null ? null : value),
    z.string().nullable(),
  ),
  tagIds: z.array(z.string()).default([]),
});

export const articleCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, "Bình luận quá ngắn")
    .max(1000, "Bình luận tối đa 1000 ký tự"),
});

export const ARTICLE_CATEGORY_LABELS: Record<
  (typeof ARTICLE_CATEGORIES)[number],
  string
> = {
  guide: "Cẩm nang",
  destination: "Điểm đến",
  food: "Ẩm thực",
  experience: "Kinh nghiệm",
  news: "Tin tức",
};
