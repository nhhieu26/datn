import { coverUrlOf } from "@/entities/article/cover";
import type {
  ArticleAdminRow,
  ArticleCategory,
  ArticleStatus,
} from "@/entities/article/type";

export type ArticleAdminItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  status: ArticleStatus;
  coverUrl: string;
  authorName: string;
  readMinutes: number;
  viewCount: number;
  commentCount: number;
  publishedAt: string | null;
};

export type ArticleCommentAdminItem = {
  id: string;
  authorName: string;
  content: string;
  isHidden: boolean;
  createdAt: string;
};

export function toArticleAdminItem(row: ArticleAdminRow): ArticleAdminItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    status: row.status,
    coverUrl: coverUrlOf(row.coverImage),
    authorName: row.author.fullname,
    readMinutes: row.readMinutes,
    viewCount: row.viewCount,
    commentCount: row._count.comments,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}
