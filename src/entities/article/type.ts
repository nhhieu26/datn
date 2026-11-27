import type { z } from "zod";
import type {
  Article,
  ArticleCategory,
  ArticleComment,
  ArticleStatus,
  Prisma,
} from "@/generated/prisma/client";
import type { articleSchema } from "./schema";

export type { Article, ArticleCategory, ArticleComment, ArticleStatus };
export type ArticleInput = z.infer<typeof articleSchema>;
export type ArticleCoverImage = { url: string; fileId: string };

export const articleListInclude = {
  author: { select: { id: true, fullname: true } },
  province: { select: { id: true, name: true } },
} satisfies Prisma.ArticleInclude;

export type ArticleListRow = Prisma.ArticleGetPayload<{
  include: typeof articleListInclude;
}>;

export type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: {
    author: { select: { id: true; fullname: true } };
    province: { select: { id: true; name: true } };
    tags: { include: { tag: true } };
  };
}>;

export type ArticleAdminRow = Prisma.ArticleGetPayload<{
  include: {
    author: { select: { id: true; fullname: true } };
    _count: { select: { comments: true } };
  };
}>;

export type ArticleCommentRow = Prisma.ArticleCommentGetPayload<{
  include: { user: { select: { id: true; fullname: true } } };
}>;
