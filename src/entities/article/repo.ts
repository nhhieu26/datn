import type { Prisma } from "@/generated/prisma/client";
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
    select: { id: true, slug: true },
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
    where: { articleId, isHidden: false },
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

export function createComment(input: {
  articleId: string;
  userId: string;
  content: string;
}) {
  return prisma.articleComment.create({ data: input });
}

export function findCommentById(id: string) {
  return prisma.articleComment.findUnique({
    where: { id },
    include: { article: { select: { id: true, slug: true } } },
  });
}

export function setCommentHidden(id: string, isHidden: boolean) {
  return prisma.articleComment.update({ where: { id }, data: { isHidden } });
}

export function deleteComment(id: string) {
  return prisma.articleComment.delete({ where: { id } });
}
