import { formatArticleDate } from "../lib/view-model";
import { AuthorAvatar } from "./author-avatar";

function Divider() {
  return <span aria-hidden className="mx-3 h-4 w-px bg-new-paragraph/30" />;
}

/** Hàng meta: avatar + tác giả | ngày | phút đọc (như news-details). */
export function ArticleMeta({
  authorName,
  publishedAt,
  readMinutes,
}: {
  authorName: string;
  publishedAt: Date | null;
  readMinutes: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-y-2 text-sm text-new-paragraph">
      <div className="flex items-center gap-2.5">
        <AuthorAvatar name={authorName} size="md" />
        <p className="font-semibold text-new-title">{authorName}</p>
      </div>
      {publishedAt ? (
        <>
          <Divider />
          <p>{formatArticleDate(publishedAt)}</p>
        </>
      ) : null}
      <Divider />
      <p>{readMinutes} phút đọc</p>
    </div>
  );
}
