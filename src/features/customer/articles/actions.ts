"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { articleCommentSchema, articleRepo } from "@/entities/article";
import type { ActionState } from "@/shared/lib/action-state";

export type CommentActionState = ActionState;

export async function createArticleCommentAction(
  articleId: string,
  _prev: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", formError: "Vui lòng đăng nhập để bình luận." };
  }

  const parsed = articleCommentSchema.safeParse({
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const article = await articleRepo.findPublishedRefById(articleId);
  if (!article) {
    return { status: "error", formError: "Bài viết không tồn tại." };
  }

  try {
    await articleRepo.createComment({
      articleId: article.id,
      userId: session.user.id,
      content: parsed.data.content,
    });
  } catch (error) {
    console.error("Tạo bình luận thất bại", { articleId, error });
    return { status: "error", formError: "Không thể gửi bình luận. Vui lòng thử lại." };
  }

  revalidatePath(`/articles/${article.slug}`);
  return { status: "success" };
}
