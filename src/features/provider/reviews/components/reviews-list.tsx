"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ProviderReviewItem, ReviewKind } from "@/entities/review";
import { reviewUrl } from "@/features/customer/reviews/paths";
import { Pagination } from "@/features/provider/tour-bookings/components/tour-bookings-table";
import { formatRelativeTime } from "@/lib/utils";
import { buildReviewsUrl, type ReviewsQuery } from "../search-params";
import { StarRating } from "./star-rating";

const FILTERS: { value: ReviewsQuery["rating"]; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: 5, label: "★ 5" },
  { value: 4, label: "★ 4" },
  { value: 3, label: "★ 3" },
  { value: 2, label: "★ 2" },
  { value: 1, label: "★ 1" },
];

const chipClass =
  "py-1.5 px-3 inline-flex items-center rounded-lg border text-xs font-medium focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none";

export function ReviewsList({
  kind,
  items,
  query,
  total,
  page,
  pageSize,
}: {
  kind: ReviewKind;
  items: ProviderReviewItem[];
  query: ReviewsQuery;
  total: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <section
      className={`flex flex-col overflow-hidden rounded-xl border border-card-line bg-card shadow-2xs ${
        isPending ? "opacity-70" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-line px-6 py-4">
        <h2 className="text-base font-semibold text-foreground">
          Đánh giá mới nhất
        </h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo số sao">
          {FILTERS.map((f) => {
            const active = query.rating === f.value;
            return (
              <button
                key={f.value}
                type="button"
                aria-pressed={active}
                disabled={isPending}
                className={`${chipClass} ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-layer-line bg-layer text-layer-foreground hover:bg-layer-hover"
                }`}
                onClick={() =>
                  startTransition(() =>
                    router.replace(buildReviewsUrl(query, { rating: f.value }), {
                      scroll: false,
                    }),
                  )
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center px-6 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-surface text-surface-foreground">
            <StarRating value={0} className="size-5" />
          </span>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            {query.rating === "all"
              ? "Chưa có đánh giá nào"
              : "Không có đánh giá phù hợp"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground-1">
            {query.rating === "all"
              ? "Đánh giá của khách sau khi hoàn thành đơn sẽ hiển thị tại đây."
              : "Thử chọn mức sao khác để xem thêm đánh giá."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-card-line">
          {items.map((r) => (
            <li key={r.id} className="px-6 py-5">
              <div className="flex items-center gap-x-3">
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold uppercase text-surface-foreground"
                >
                  {r.customerName.trim().charAt(0) || "?"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {r.customerName}
                  </p>
                  <div className="mt-0.5 flex items-center gap-x-2">
                    <StarRating value={r.rating} className="size-3.5" />
                    <span
                      className="text-xs uppercase text-muted-foreground-1"
                      suppressHydrationWarning
                    >
                      | {formatRelativeTime(r.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={reviewUrl(kind, r.serviceSlug)}
                target="_blank"
                className="mt-3 inline-block text-xs font-semibold uppercase text-primary hover:underline"
              >
                {r.serviceName}
              </Link>
              <p className="mt-2 whitespace-pre-line wrap-break-word text-sm italic text-muted-foreground-2">
                “{r.content}”
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-card-line px-6 py-4">
        <p className="text-sm text-muted-foreground-1">
          Hiển thị {from} - {to} / {total} đánh giá
        </p>
        <Pagination
          page={page}
          totalPages={totalPages}
          href={(p) => buildReviewsUrl(query, { page: p })}
        />
      </div>
    </section>
  );
}
