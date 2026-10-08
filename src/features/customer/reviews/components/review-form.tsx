"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ReviewKind } from "@/entities/review";
import { createReviewAction } from "../actions";

const RATING_LABELS = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"];

export function ReviewForm({
  kind,
  bookings,
}: {
  kind: ReviewKind;
  /** đơn completed chưa đánh giá; label là ngày sử dụng dịch vụ */
  bookings: { code: string; label: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [bookingCode, setBookingCode] = useState(bookings[0].code);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    startTransition(async () => {
      const result = await createReviewAction({
        kind,
        bookingCode,
        rating,
        content,
      });
      if (result.status === "error") {
        setError(result.formError ?? "");
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setRating(0);
      setContent("");
      router.refresh();
    });
  }

  const shown = hover || rating;

  return (
    <div className="mt-10 rounded-lg bg-new-chip px-5 py-[30px] sm:px-10">
      <h4 className="mb-[30px] text-2xl font-bold text-new-title">
        Viết đánh giá của bạn
      </h4>
      <form className="flex flex-col gap-6" onSubmit={submit}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <span className="mb-2 block text-sm font-semibold text-new-title">
              Chất lượng dịch vụ
            </span>
            <div
              className="flex h-[52px] items-center gap-3 rounded border border-new-input-border bg-white px-5"
              onMouseLeave={() => setHover(0)}
            >
              <div className="flex" role="radiogroup" aria-label="Số sao">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    aria-checked={rating === n}
                    aria-label={`${n} sao`}
                    className={`cursor-pointer transition ${n <= shown ? "text-new-star" : "text-new-input-border"}`}
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    role="radio"
                    type="button"
                  >
                    <span
                      aria-hidden
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "26px",
                        fontVariationSettings: n <= shown ? "'FILL' 1" : undefined,
                      }}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
              <span className="text-sm text-new-paragraph">
                {RATING_LABELS[shown]}
              </span>
            </div>
            {fieldErrors.rating ? (
              <span className="mt-1 block text-xs text-rose-600">
                {fieldErrors.rating[0]}
              </span>
            ) : null}
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-new-title">
              Đơn đặt
            </span>
            <select
              className="h-[52px] w-full rounded border border-new-input-border bg-white px-5 text-base text-new-title focus:border-new-teal-cta focus:ring-0 disabled:opacity-100"
              disabled={bookings.length === 1}
              onChange={(e) => setBookingCode(e.target.value)}
              value={bookingCode}
            >
              {bookings.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.code} · {b.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <textarea
            aria-label="Nội dung đánh giá"
            className="w-full resize-none rounded border border-new-input-border bg-white px-5 py-4 text-base text-new-title placeholder:text-new-placeholder focus:border-new-teal-cta focus:ring-0"
            maxLength={1000}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn..."
            rows={6}
            value={content}
          />
          {fieldErrors.content ? (
            <span className="mt-1 block text-xs text-rose-600">
              {fieldErrors.content[0]}
            </span>
          ) : null}
        </label>
        {error ? (
          <p className="rounded border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        <div className="mt-4">
          <button
            className="cursor-pointer rounded border border-new-teal-cta bg-new-teal-cta px-[30px] py-3.5 text-base font-bold text-white transition hover:bg-new-teal-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </form>
    </div>
  );
}
