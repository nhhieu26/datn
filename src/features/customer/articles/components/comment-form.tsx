"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { createArticleCommentAction, type CommentActionState } from "../actions";

const INITIAL: CommentActionState = { status: "idle" };

export function CommentForm({
  articleId,
  slug,
  isSignedIn,
}: {
  articleId: string;
  slug: string;
  isSignedIn: boolean;
}) {
  const [state, action, pending] = useActionState(
    createArticleCommentAction.bind(null, articleId),
    INITIAL,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <div className="rounded-lg border border-new-chip bg-white p-6 sm:p-8">
      <h4 className="mb-5 text-xl font-bold text-new-title">Viết bình luận</h4>
      {isSignedIn ? (
        <form action={action} className="space-y-4" ref={formRef}>
          <textarea
            aria-label="Nội dung bình luận"
            className="block min-h-32 w-full resize-y rounded-lg border border-new-chip px-4 py-3 text-sm text-new-title placeholder:text-new-paragraph/60 focus:border-new-teal focus:ring-new-teal"
            maxLength={1000}
            name="content"
            defaultValue={state.status === "error" ? (state.data?.content ?? "") : ""}
            placeholder="Chia sẻ cảm nghĩ hoặc kinh nghiệm của bạn…"
            required
          />
          {state.status === "error" ? (
            <p className="text-sm text-red-600">
              {state.fieldErrors?.content?.[0] ?? state.formError}
            </p>
          ) : null}
          {state.status === "success" ? (
            state.data?.moderation === "pending" ? (
              <p className="text-sm text-amber-700">
                Cảm ơn bạn! Bình luận đang chờ kiểm duyệt và sẽ hiển thị sau khi được duyệt.
              </p>
            ) : state.data?.moderation === "rejected" ? (
              <p className="text-sm text-red-600">
                Bình luận không được hiển thị do vi phạm tiêu chuẩn cộng đồng.
              </p>
            ) : (
              <p className="text-sm text-new-teal">Cảm ơn bạn! Bình luận đã được đăng.</p>
            )
          ) : null}
          <button
            className="inline-flex items-center rounded-md bg-new-teal px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-new-teal-cta disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? "Đang gửi…" : "Gửi bình luận"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-new-paragraph">
          Vui lòng{" "}
          <Link
            className="font-semibold text-new-teal underline-offset-2 hover:underline"
            href={`/sign-in?callbackUrl=${encodeURIComponent(`/articles/${slug}#comments`)}`}
          >
            đăng nhập
          </Link>{" "}
          để bình luận.
        </p>
      )}
    </div>
  );
}
