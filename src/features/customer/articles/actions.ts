"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { articleCommentSchema, articleRepo } from "@/entities/article";
import { notifyArticleCommentCreated, notifyContentFlagged } from "@/entities/notification";
import { attachModerationLogs, moderateContent } from "@/lib/moderation";
import type { ActionState } from "@/shared/lib/action-state";

export type CommentActionState = ActionState<{
  /** trạng thái kiểm duyệt của bình luận vừa gửi */
  moderation?: "approved" | "pending" | "rejected";
  /** nội dung đã nhập, trả lại khi lỗi để form không bị xóa trắng */
  content?: string;
}>;

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
      data: { content: String(formData.get("content") ?? "") },
    };
  }

  const article = await articleRepo.findPublishedRefById(articleId);
  if (!article) {
    return { status: "error", formError: "Bài viết không tồn tại." };
  }

  const content = parsed.data.content;
  // Admin bình luận trên trang của mình không cần kiểm duyệt
  const decision =
    session.user.role === "admin"
      ? ({ action: "save", status: "approved", source: "admin", reason: null, categories: [], logIds: [] } as const)
      : await moderateContent({
          target: "article_comment",
          userId: session.user.id,
          content,
          subject: article.title,
        });
  if (decision.action === "block") {
    return { status: "error", fieldErrors: { content: [decision.reason] }, data: { content } };
  }

  let commentId: string;
  try {
    const comment = await articleRepo.createComment(
      { articleId: article.id, userId: session.user.id, content },
      { status: decision.status, source: decision.source, reason: decision.reason, categories: [...decision.categories] },
    );
    commentId = comment.id;
  } catch (error) {
    console.error("Tạo bình luận thất bại", { articleId, error });
    return {
      status: "error",
      formError: "Không thể gửi bình luận. Vui lòng thử lại.",
      data: { content },
    };
  }
  await attachModerationLogs([...decision.logIds], commentId);

  if (decision.status === "approved") {
    await notifyArticleCommentCreated({
      articleId: article.id,
      articleTitle: article.title,
      commentId,
      commenterName: session.user.name ?? "Khách hàng",
      commenterRole: session.user.role,
      content,
    });
  } else {
    await notifyContentFlagged({
      target: "article_comment",
      id: commentId,
      authorName: session.user.name ?? "Khách hàng",
      subject: article.title,
      content,
      status: decision.status,
      reason: decision.reason,
    });
    revalidatePath("/admin/moderation");
  }

  revalidatePath(`/articles/${article.slug}`);
  revalidatePath(`/admin/articles/${article.id}/edit`);
  return { status: "success", data: { moderation: decision.status } };
}
