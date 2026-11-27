import { coverUrlOf } from "@/entities/article/cover";
import { ARTICLE_CATEGORY_LABELS } from "@/entities/article/schema";
import type { ArticleCategory, ArticleListRow } from "@/entities/article/type";

export type ArticleSummary = {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  categoryLabel: string;
  coverUrl: string;
  authorName: string;
  publishedAt: Date | null;
  readMinutes: number;
};

export function toArticleSummary(row: ArticleListRow): ArticleSummary {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    categoryLabel: ARTICLE_CATEGORY_LABELS[row.category],
    coverUrl: coverUrlOf(row.coverImage),
    authorName: row.author.fullname,
    publishedAt: row.publishedAt,
    readMinutes: row.readMinutes,
  };
}

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function formatArticleDate(date: Date | null): string {
  return date ? dateFormatter.format(date) : "";
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts.at(-1)![0] : parts[0]?.[0] ?? "?")
    .toUpperCase();
}
