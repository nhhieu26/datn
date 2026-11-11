import type { ArticleCommentRow } from "@/entities/article";
import { formatArticleDate } from "../lib/view-model";
import { AuthorAvatar } from "./author-avatar";
import { CommentForm } from "./comment-form";

export function ArticleComments({
  articleId,
  slug,
  comments,
  isSignedIn,
}: {
  articleId: string;
  slug: string;
  comments: ArticleCommentRow[];
  isSignedIn: boolean;
}) {
  return (
    <section aria-labelledby="comments-heading" id="comments">
      <h4 className="mb-6 text-2xl font-bold text-new-title" id="comments-heading">
        ({comments.length}) Bình luận
      </h4>
      {comments.length > 0 ? (
        <ul className="mb-10 space-y-6">
          {comments.map((c) => (
            <li className="flex gap-4 border-b border-new-chip pb-6 last:border-b-0" key={c.id}>
              <AuthorAvatar name={c.user.fullname} size="md" tone="coral" />
              <div className="min-w-0">
                <h5 className="font-bold text-new-title">{c.user.fullname}</h5>
                <p className="mb-2 text-xs text-new-teal">{formatArticleDate(c.createdAt)}</p>
                <p className="text-sm leading-relaxed whitespace-pre-line text-new-paragraph">
                  {c.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-10 text-sm text-new-paragraph">
          Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!
        </p>
      )}
      <CommentForm articleId={articleId} isSignedIn={isSignedIn} slug={slug} />
    </section>
  );
}
