import Link from "next/link";
import type { ReactNode } from "react";

export type DateRange = "all" | "7d" | "30d" | "12m" | "custom";

const selectClass =
  "cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-8 pl-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100/70 focus:border-brand-500 focus:outline-none";

export const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "all", label: "Mọi thời gian" },
  { value: "7d", label: "7 ngày qua" },
  { value: "30d", label: "30 ngày qua" },
  { value: "12m", label: "12 tháng qua" },
  { value: "custom", label: "Tùy chọn" },
];

export const dateInputClass =
  "rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100/70 focus:border-brand-500 focus:outline-none";

export function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative max-w-[220px]">
      <select
        className={`${selectClass} w-full truncate`}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
      <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[18px] text-slate-400">
        expand_more
      </span>
    </div>
  );
}

function pageList(page: number, totalPages: number): (number | "gap")[] {
  const pages = new Set(
    [1, totalPages, page - 1, page, page + 1].filter(
      (p) => p >= 1 && p <= totalPages,
    ),
  );
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

const pageButtonClass =
  "inline-flex size-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors";

export function Pagination({
  page,
  totalPages,
  href,
}: {
  page: number;
  totalPages: number;
  href: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Phân trang" className="flex items-center gap-1.5">
      {page > 1 ? (
        <Link
          aria-label="Trang trước"
          className={`${pageButtonClass} border-slate-200 text-slate-600 hover:bg-slate-100`}
          href={href(page - 1)}
          scroll={false}
        >
          <span className="material-symbols-outlined text-[18px]">
            chevron_left
          </span>
        </Link>
      ) : null}
      {pageList(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            aria-current={p === page ? "page" : undefined}
            className={`${pageButtonClass} ${
              p === page
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
            href={href(p)}
            scroll={false}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link
          aria-label="Trang sau"
          className={`${pageButtonClass} border-slate-200 text-slate-600 hover:bg-slate-100`}
          href={href(page + 1)}
          scroll={false}
        >
          <span className="material-symbols-outlined text-[18px]">
            chevron_right
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
