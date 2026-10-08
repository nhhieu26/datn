import Link from "next/link";
import type { ReviewItem } from "@/entities/review";
import { formatDate } from "@/lib/utils";
import { ReviewStars } from "./review-stars";

export function ReviewList({
  reviews,
  total,
  moreHref,
}: {
  reviews: ReviewItem[];
  total: number;
  /** link tải thêm review, null khi đã hiện hết */
  moreHref: string | null;
}) {
  return (
    <div>
      <h4 className="mb-[30px] text-2xl font-bold text-new-title">
        ({total}) Đánh giá
      </h4>
      {reviews.length === 0 ? (
        <p className="border-b border-new-checkbox-border pb-5 text-sm text-new-paragraph">
          Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sau khi trải
          nghiệm dịch vụ.
        </p>
      ) : (
        reviews.map((r) => (
          <article
            className="mb-5 border-b border-new-checkbox-border pb-[15px]"
            key={r.id}
          >
            <div className="mb-[15px] flex items-center justify-between gap-3">
              <div className="flex items-center gap-[15px]">
                <span
                  aria-hidden
                  className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-new-chip font-bold text-new-teal"
                >
                  {r.customerName.trim().split(" ").at(-1)?.[0]?.toUpperCase()}
                </span>
                <div>
                  <h4 className="text-lg font-semibold text-new-title">
                    {r.customerName}
                  </h4>
                  <ReviewStars rating={r.rating} />
                </div>
              </div>
              <p className="self-start text-sm text-new-title">
                {formatDate(r.createdAt)}
              </p>
            </div>
            <p className="text-sm leading-[1.6] whitespace-pre-line text-new-paragraph">
              {r.content}
            </p>
          </article>
        ))
      )}
      {moreHref ? (
        <Link
          className="text-sm font-semibold text-new-teal-cta hover:underline"
          href={moreHref}
          scroll={false}
        >
          Xem thêm đánh giá
        </Link>
      ) : null}
    </div>
  );
}
