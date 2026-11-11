"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { deleteImage, uploadImage } from "@/lib/imagekit";
import { slugify } from "@/lib/utils";
import {
  articleRepo,
  articleSchema,
  type Article,
  type ArticleCoverImage,
} from "@/entities/article";
import { provinceRepo } from "@/entities/province";
import { tagRepo } from "@/entities/tag";
import {
  fromZodError,
  runAction,
  type ActionState,
} from "@/shared/lib/action-state";
import {
  computeReadMinutes,
  htmlToPlainText,
  sanitizeArticleHtml,
} from "@/shared/lib/article-html";
import { NotFoundError, ValidationError } from "@/shared/lib/errors";
import { isValidImageFile } from "@/shared/lib/image-file";
import { requireAdmin } from "@/shared/lib/require-admin";

export type ArticleActionState = ActionState<{
  id: string;
  slug: string;
  coverUrl: string;
}>;

const ARTICLE_FOLDER = "articles";
const MAX_SLUG_ATTEMPTS = 5;

function parseTagIds(formData: FormData): string[] {
  const raw = formData.get("tagIds");
  if (typeof raw !== "string" || !raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? [...new Set(value.map(String))] : [];
  } catch {
    return [];
  }
}

function parseCover(value: unknown): ArticleCoverImage | null {
  const v = value as Partial<ArticleCoverImage> | null;
  return typeof v?.url === "string" && typeof v?.fileId === "string"
    ? { url: v.url, fileId: v.fileId }
    : null;
}

/** Ảnh seed có fileId trùng url, không nằm trên ImageKit. */
async function safeDeleteImage(image: ArticleCoverImage | null) {
  if (!image || image.fileId === image.url) return;
  try {
    await deleteImage(image.fileId);
  } catch (error) {
    console.error("Xóa ảnh bài viết thất bại", { fileId: image.fileId, error });
  }
}

async function parseArticleForm(formData: FormData) {
  const parsed = articleSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    category: formData.get("category"),
    status: formData.get("status") ?? "draft",
    provinceId: formData.get("provinceId"),
    tagIds: parseTagIds(formData),
  });
  if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));

  const content = sanitizeArticleHtml(parsed.data.content);
  if (!htmlToPlainText(content)) {
    throw new ValidationError({ content: ["Vui lòng nhập nội dung bài viết"] });
  }

  const [province, tags] = await Promise.all([
    parsed.data.provinceId
      ? provinceRepo.findById(parsed.data.provinceId)
      : Promise.resolve(null),
    tagRepo.findManyByIds(parsed.data.tagIds),
  ]);
  if (parsed.data.provinceId && !province) {
    throw new ValidationError({ provinceId: ["Tỉnh/thành không tồn tại."] });
  }
  if (tags.length !== parsed.data.tagIds.length) {
    throw new ValidationError({ tagIds: ["Một hoặc nhiều thẻ không tồn tại."] });
  }

  const cover = formData.get("cover");
  const coverFile = cover instanceof File && cover.size > 0 ? cover : null;
  if (coverFile && !(await isValidImageFile(coverFile))) {
    throw new ValidationError({
      cover: ["Ảnh bìa phải là PNG/JPG hợp lệ và dưới 5MB."],
    });
  }

  return {
    data: { ...parsed.data, content, readMinutes: computeReadMinutes(content) },
    coverFile,
  };
}

function revalidateArticle(slug: string) {
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath(`/articles/${slug}`);
}

export async function createArticleAction(
  _prev: ArticleActionState,
  formData: FormData,
): Promise<ArticleActionState> {
  let uploaded: ArticleCoverImage | null = null;

  const result = await runAction(async () => {
    const session = await requireAdmin();
    const { data, coverFile } = await parseArticleForm(formData);
    if (!coverFile) {
      throw new ValidationError({ cover: ["Vui lòng chọn ảnh bìa."] });
    }

    uploaded = await uploadImage(coverFile, ARTICLE_FOLDER);
    const base = slugify(data.title) || "bai-viet";
    const publishedAt = data.status === "published" ? new Date() : null;

    let article: Article | null = null;
    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS && !article; attempt++) {
      const slug =
        attempt === 0 ? base : `${base}-${randomUUID().slice(0, 8)}`;
      try {
        article = await articleRepo.create({
          ...data,
          slug,
          authorId: session.user.id,
          coverImage: uploaded,
          publishedAt,
        });
      } catch (error) {
        const isDuplicate =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002";
        if (!isDuplicate || attempt === MAX_SLUG_ATTEMPTS - 1) throw error;
      }
    }
    return { id: article!.id, slug: article!.slug, coverUrl: uploaded.url };
  });

  if (result.status === "error") {
    await safeDeleteImage(uploaded);
    return result;
  }
  revalidateArticle(result.data!.slug);
  redirect(`/admin/articles/${result.data!.id}/edit?saved=1`);
}

export async function updateArticleAction(
  articleId: string,
  _prev: ArticleActionState,
  formData: FormData,
): Promise<ArticleActionState> {
  let uploaded: ArticleCoverImage | null = null;
  let replaced: ArticleCoverImage | null = null;

  const result = await runAction(async () => {
    await requireAdmin();
    const existing = await articleRepo.findById(articleId);
    if (!existing) throw new NotFoundError("Không tìm thấy bài viết.");

    const { data, coverFile } = await parseArticleForm(formData);
    const currentCover = parseCover(existing.coverImage);
    if (!coverFile && !currentCover) {
      throw new ValidationError({ cover: ["Vui lòng chọn ảnh bìa."] });
    }
    if (coverFile) {
      uploaded = await uploadImage(coverFile, ARTICLE_FOLDER);
      replaced = currentCover;
    }

    const publishedAt =
      data.status === "published" ? (existing.publishedAt ?? new Date()) : null;

    const coverImage = uploaded ?? currentCover!;
    await articleRepo.update(articleId, { ...data, coverImage, publishedAt });
    return { id: existing.id, slug: existing.slug, coverUrl: coverImage.url };
  });

  if (result.status === "error") {
    await safeDeleteImage(uploaded);
    return result;
  }
  await safeDeleteImage(replaced);
  revalidateArticle(result.data!.slug);
  return result;
}

export async function deleteArticleAction(
  articleId: string,
): Promise<ActionState> {
  return runAction<undefined>(async () => {
    await requireAdmin();
    const article = await articleRepo.findById(articleId);
    if (!article) throw new NotFoundError("Không tìm thấy bài viết.");
    await articleRepo.remove(articleId);
    await safeDeleteImage(parseCover(article.coverImage));
    revalidateArticle(article.slug);
    return undefined;
  });
}

/** Tải ảnh chèn trong nội dung bài viết (trình soạn thảo Tiptap). */
export async function uploadArticleInlineImageAction(
  formData: FormData,
): Promise<ActionState<{ url: string }>> {
  return runAction(async () => {
    await requireAdmin();
    const file = formData.get("image");
    if (!(file instanceof File) || !(await isValidImageFile(file))) {
      throw new ValidationError(
        { image: ["Ảnh phải là PNG/JPG hợp lệ và dưới 5MB."] },
        "Ảnh phải là PNG/JPG hợp lệ và dưới 5MB.",
      );
    }
    const { url } = await uploadImage(file, `${ARTICLE_FOLDER}/content`);
    return { url };
  });
}

export async function setArticleCommentHiddenAction(
  commentId: string,
  isHidden: boolean,
): Promise<ActionState> {
  return runAction<undefined>(async () => {
    await requireAdmin();
    const comment = await articleRepo.findCommentById(commentId);
    if (!comment) throw new NotFoundError("Không tìm thấy bình luận.");
    await articleRepo.setCommentHidden(commentId, isHidden);
    revalidatePath(`/articles/${comment.article.slug}`);
    revalidatePath(`/admin/articles/${comment.article.id}/edit`);
    return undefined;
  });
}

export async function deleteArticleCommentAction(
  commentId: string,
): Promise<ActionState> {
  return runAction<undefined>(async () => {
    await requireAdmin();
    const comment = await articleRepo.findCommentById(commentId);
    if (!comment) throw new NotFoundError("Không tìm thấy bình luận.");
    await articleRepo.deleteComment(commentId);
    revalidatePath(`/articles/${comment.article.slug}`);
    revalidatePath(`/admin/articles/${comment.article.id}/edit`);
    return undefined;
  });
}
