import { formatVnd } from "@/features/customer/components/cards/card-parts";
import type { ReactNode } from "react";
import type { BookingSummary } from "../types";

export function BookingSummaryCard({
  summary,
  children,
}: {
  summary: BookingSummary;
  /** Nút hành động bên dưới (Tiếp tục / Thanh toán) */
  children?: ReactNode;
}) {
  return (
    <aside className="sticky top-4 rounded-lg bg-new-chip p-6">
      {summary.totalAmount != null && (
        <div className="flex items-end gap-3">
          <span className="pb-1 text-new-paragraph">Tổng</span>
          <span className="text-3xl font-bold text-new-title">
            {formatVnd(summary.totalAmount)}
          </span>
        </div>
      )}

      <p className="mt-3 text-sm font-medium text-new-paragraph">
        {summary.highlight.label}
      </p>
      <div className="mt-1.5 flex items-center gap-3 rounded bg-white px-5 py-3 font-medium text-new-title">
        <span aria-hidden className="material-symbols-outlined">
          schedule
        </span>
        {summary.highlight.value}
      </div>

      <div className="mt-5 flex items-start gap-2 font-bold text-new-teal">
        <span aria-hidden className="material-symbols-outlined">
          location_on
        </span>
        <div>
          <p>{summary.name}</p>
          <p className="text-sm font-medium">{summary.location}</p>
        </div>
      </div>

      <dl className="mt-4 rounded-lg bg-white p-5 text-sm">
        {summary.rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between gap-4 py-1.5 text-new-paragraph"
          >
            <dt className="shrink-0">{row.label}</dt>
            <dd
              className="min-w-0 truncate text-right font-medium whitespace-nowrap text-new-title"
              title={row.value}
            >
              {row.value}
            </dd>
          </div>
        ))}
        {summary.totalAmount != null && (
          <div className="mt-3 flex justify-between border-t border-new-input-border pt-3 font-bold text-new-teal">
            <dt>Tổng cộng</dt>
            <dd>{formatVnd(summary.totalAmount)}</dd>
          </div>
        )}
      </dl>

      {children && <div className="mt-6">{children}</div>}

      <div className="pt-6">
        <h4 className="flex items-center gap-2 pb-1.5 font-bold text-new-title lg:text-lg">
          <span aria-hidden className="material-symbols-outlined">
            free_cancellation
          </span>
          Hủy miễn phí
        </h4>
        <p className="text-new-paragraph">{summary.cancellation}</p>
      </div>
    </aside>
  );
}
