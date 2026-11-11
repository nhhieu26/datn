import type { ModerationStatus, Prisma } from "@/generated/prisma/client";
import type { ModerationOutcome } from "@/lib/moderation/types";
import { prisma } from "@/lib/prisma";
import {
  articleListInclude,
  type Article,
  type ArticleAdminRow,
  type ArticleCategory,
  type ArticleCommentRow,
  type ArticleCoverImage,
  type ArticleInput,
  type ArticleListRow,
  type ArticleWithRelations,
} from "./type";

const detailInclude = {
  ...articleListInclude,
  tags: { include: { tag: true } },
} satisfies Prisma.ArticleInclude;

const published = { status: "published" } as const;
const newestFirst: Prisma.ArticleOrderByWithRelationInput[] = [
  { publishedAt: "desc" },
  { createdAt: "desc" },
];

// ---- Phía khách ----

export async function findPublishedPaged(filter: {
  q?: string;
  category?: ArticleCategory;
  skip?: number;
  take: number;
}): Promise<{ items: ArticleListRow[]; total: number }> {
  const where: Prisma.ArticleWhereInput = {
    ...published,
    ...(filter.category && { category: filter.category }),
    ...(filter.q && {
      OR: [
        { title: { contains: filter.q, mode: "insensitive" } },
        { excerpt: { contains: filter.q, mode: "insensitive" } },
        { province: { name: { contains: filter.q, mode: "insensitive" } } },
        {
          tags: {
            some: { tag: { name: { contains: filter.q, mode: "insensitive" } } },
          },
        },
      ],
    }),
  };
  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: articleListInclude,
      orderBy: newestFirst,
      skip: filter.skip,
      take: filter.take,
    }),
    prisma.article.count({ where }),
  ]);
  return { items, total };
}

export function findPublishedBySlug(
  slug: string,
): Promise<ArticleWithRelations | null> {
  return prisma.article.findFirst({
    where: { slug, ...published },
    include: detailInclude,
  });
}

export function findPublishedRefById(id: string) {
  return prisma.article.findFirst({
    where: { id, ...published },
    select: { id: true, slug: true, title: true },
  });
}

export function findRecent(
  take: number,
  excludeId?: string,
): Promise<ArticleListRow[]> {
  return prisma.article.findMany({
    where: { ...published, ...(excludeId && { id: { not: excludeId } }) },
    include: articleListInclude,
    orderBy: newestFirst,
    take,
  });
}

export function findRelated(
  article: Pick<Article, "id" | "category" | "provinceId">,
  take: number,
): Promise<ArticleListRow[]> {
  return prisma.article.findMany({
    where: {
      ...published,
      id: { not: article.id },
      OR: [
        { category: article.category },
        ...(article.provinceId ? [{ provinceId: article.provinceId }] : []),
      ],
    },
    include: articleListInclude,
    orderBy: newestFirst,
    take,
  });
}

export function incrementView(id: string) {
  return prisma.article.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
    select: { id: true },
  });
}

// ---- Quản trị ----

export function findAllForAdmin(): Promise<ArticleAdminRow[]> {
  return prisma.article.findMany({
    include: {
      author: { select: { id: true, fullname: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function findById(id: string): Promise<ArticleWithRelations | null> {
  return prisma.article.findUnique({ where: { id }, include: detailInclude });
}

type WriteInput = Omit<ArticleInput, "content"> & {
  content: string;
  coverImage: ArticleCoverImage;
  readMinutes: number;
  publishedAt: Date | null;
};

export function create(
  input: WriteInput & { slug: string; authorId: string },
): Promise<Article> {
  const { tagIds, ...rest } = input;
  return prisma.article.create({
    data: { ...rest, tags: { create: tagIds.map((tagId) => ({ tagId })) } },
  });
}

export function update(id: string, input: WriteInput): Promise<Article> {
  const { tagIds, ...rest } = input;
  return prisma.$transaction(async (tx) => {
    const article = await tx.article.update({ where: { id }, data: rest });
    await tx.articleTag.deleteMany({ where: { articleId: id } });
    await tx.articleTag.createMany({
      data: tagIds.map((tagId) => ({ articleId: id, tagId })),
    });
    return article;
  });
}

export function remove(id: string): Promise<Article> {
  return prisma.article.delete({ where: { id } });
}

// ---- Bình luận ----

const commentInclude = {
  user: { select: { id: true, fullname: true } },
} satisfies Prisma.ArticleCommentInclude;

export function findVisibleComments(
  articleId: string,
): Promise<ArticleCommentRow[]> {
  return prisma.articleComment.findMany({
    where: { articleId, status: "approved" },
    include: commentInclude,
    orderBy: { createdAt: "desc" },
  });
}

export function findAllComments(articleId: string): Promise<ArticleCommentRow[]> {
  return prisma.articleComment.findMany({
    where: { articleId },
    include: commentInclude,
    orderBy: { createdAt: "desc" },
  });
}

export function createComment(
  input: { articleId: string; userId: string; content: string },
  moderation: ModerationOutcome,
) {
  return prisma.articleComment.create({
    data: {
      ...input,
      status: moderation.status,
      moderationSource: moderation.source,
      moderationReason: moderation.reason,
      moderationCategories: moderation.categories,
      moderatedAt: new Date(),
    },
  });
}

export function findCommentById(id: string) {
  return prisma.articleComment.findUnique({
    where: { id },
    include: { article: { select: { id: true, slug: true } } },
  });
}

/** Admin duyệt / ẩn bình luận. */
export function setCommentStatus(
  id: string,
  status: ModerationStatus,
  reason?: string | null,
) {
  return prisma.articleComment.update({
    where: { id },
    data: {
      status,
      moderationSource: "admin",
      moderatedAt: new Date(),
      ...(reason !== undefined ? { moderationReason: reason } : {}),
      ...(status === "approved" ? { moderationCategories: [] } : {}),
    },
    include: { article: { select: { id: true, slug: true } } },
  });
}

// ---- Kiểm duyệt (admin) ----

export type CommentModerationFilter = {
  status?: ModerationStatus;
  source?: "keyword" | "ai" | "admin" | "fallback";
  q?: string;
};

const commentModerationInclude = {
  user: { select: { fullname: true, email: true } },
  article: { select: { id: true, title: true, slug: true } },
} satisfies Prisma.ArticleCommentInclude;

export type CommentModerationRow = Prisma.ArticleCommentGetPayload<{
  include: typeof commentModerationInclude;
}>;

function commentModerationWhere(
  filter: CommentModerationFilter,
): Prisma.ArticleCommentWhereInput {
  return {
    ...(filter.status ? { status: filter.status } : {}),
    ...(filter.source ? { moderationSource: filter.source } : {}),
    ...(filter.q
      ? {
          OR: [
            { content: { contains: filter.q, mode: "insensitive" } },
            { user: { fullname: { contains: filter.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

export async function findCommentPageForModeration(
  filter: CommentModerationFilter,
  { skip, take }: { skip: number; take: number },
): Promise<{ items: CommentModerationRow[]; total: number }> {
  const where = commentModerationWhere(filter);
  const [items, total] = await Promise.all([
    prisma.articleComment.findMany({
      where,
      include: commentModerationInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.articleComment.count({ where }),
  ]);
  return { items, total };
}

export async function countCommentsByStatus(): Promise<Record<ModerationStatus, number>> {
  const groups = await prisma.articleComment.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const result: Record<ModerationStatus, number> = { approved: 0, pending: 0, rejected: 0 };
  for (const g of groups) result[g.status] = g._count._all;
  return result;
}

export function deleteComment(id: string) {
  return prisma.articleComment.delete({ where: { id } });
}
