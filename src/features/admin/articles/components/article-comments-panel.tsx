"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatDateTime } from "@/lib/utils";
import {
  deleteArticleCommentAction,
  setArticleCommentHiddenAction,
} from "../actions";
import type { ArticleCommentAdminItem } from "../types";
import { cardClass, layerButtonClass } from "./styles";

export function ArticleCommentsPanel({
  comments,
}: {
  comments: ArticleCommentAdminItem[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const run = (id: string, action: () => Promise<{ status: string; formError?: string }>) => {
    setBusyId(id);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.status === "error") setError(result.formError ?? "Thao tác thất bại.");
      setBusyId(null);
      setConfirmId(null);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto w-full max-w-340 scroll-mt-6 px-4 pb-6 sm:px-6" id="comments">
      <div className={cardClass}>
        <div className="border-b border-card-divider px-4 py-3 md:px-5">
          <h2 className="font-semibold text-foreground">
            Bình luận ({comments.length})
          </h2>
          <p className="text-sm text-muted-foreground-1">
            Bình luận bị ẩn sẽ không hiển thị với khách.
          </p>
        </div>
        {error ? <p className="px-5 pt-3 text-sm text-red-600">{error}</p> : null}
        {comments.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground-1">Chưa có bình luận nào.</p>
        ) : (
          <ul className="divide-y divide-card-divider">
            {comments.map((c) => (
              <li
                className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-start md:px-5 ${
                  c.isHidden ? "opacity-60" : ""
                }`}
                key={c.id}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {c.authorName}
                    <span className="ms-2 text-xs font-normal text-muted-foreground-1">
                      {formatDateTime(c.createdAt)}
                    </span>
                    {c.isHidden ? (
                      <span className="ms-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                        Đang ẩn
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground-2">
                    {c.content}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    className={layerButtonClass}
                    disabled={busyId === c.id}
                    onClick={() =>
                      run(c.id, () => setArticleCommentHiddenAction(c.id, !c.isHidden))
                    }
                    type="button"
                  >
                    {c.isHidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    {c.isHidden ? "Hiện" : "Ẩn"}
                  </button>
                  {confirmId === c.id ? (
                    <button
                      className="inline-flex items-center gap-x-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      disabled={busyId === c.id}
                      onClick={() => run(c.id, () => deleteArticleCommentAction(c.id))}
                      type="button"
                    >
                      Xác nhận xoá
                    </button>
                  ) : (
                    <button
                      className={`${layerButtonClass} text-red-600`}
                      onClick={() => setConfirmId(c.id)}
                      type="button"
                    >
                      <Trash2 className="size-4" />
                      Xoá
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
