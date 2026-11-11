"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { articleCommentSchema, articleRepo } from "@/entities/article";
import { notifyArticleCommentCreated } from "@/entities/notification";
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

  let commentId: string;
  try {
    const comment = await articleRepo.createComment({
      articleId: article.id,
      userId: session.user.id,
      content: parsed.data.content,
    });
    commentId = comment.id;
  } catch (error) {
    console.error("Tạo bình luận thất bại", { articleId, error });
    return { status: "error", formError: "Không thể gửi bình luận. Vui lòng thử lại." };
  }

  await notifyArticleCommentCreated({
    articleId: article.id,
    articleTitle: article.title,
    commentId,
    commenterName: session.user.name ?? "Khách hàng",
    commenterRole: session.user.role,
    content: parsed.data.content,
  });

  revalidatePath(`/articles/${article.slug}`);
  revalidatePath(`/admin/articles/${article.id}/edit`);
  return { status: "success" };
}
