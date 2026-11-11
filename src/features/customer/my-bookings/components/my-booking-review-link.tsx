import Link from "next/link";
import type { ReviewState } from "../types";

export function MyBookingReviewLink({ review }: { review: ReviewState }) {
  if (!review) return null;
  if (review === "review_pending" || review === "review_rejected") {
    const pending = review === "review_pending";
    return (
      <span
        className={`mt-1.5 flex items-center gap-1 text-xs ${pending ? "text-amber-700" : "text-rose-600"}`}
      >
        <span aria-hidden className="material-symbols-outlined" style={{ fontSize: "14px" }}>
          {pending ? "hourglass_top" : "visibility_off"}
        </span>
        {pending ? "Đánh giá chờ kiểm duyệt" : "Đánh giá bị ẩn"}
      </span>
    );
  }
  if (review === "reviewed") {
    return (
      <span className="mt-1.5 flex items-center gap-1 text-xs text-new-paragraph">
        <span
          aria-hidden
          className="material-symbols-outlined text-new-star"
          style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
        Đã đánh giá
      </span>
    );
  }
  return (
    <Link
      className="mt-1.5 flex w-fit items-center gap-1 text-xs font-semibold text-new-teal-cta hover:underline"
      href={review}
    >
      <span aria-hidden className="material-symbols-outlined" style={{ fontSize: "15px" }}>
        rate_review
      </span>
      Đánh giá
    </Link>
  );
}
