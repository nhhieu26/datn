import Link from "next/link";
import { buildExploreUrl, type ExploreQuery } from "../lib/search-params";

type PaginationProps = {
  page: number;
  totalPages: number;
  query: ExploreQuery;
};

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

const base =
  "inline-flex size-10 items-center justify-center rounded border text-sm font-medium transition-colors";

export function Pagination({ page, totalPages, query }: PaginationProps) {
  if (totalPages <= 1) return null;
  const href = (p: number) => buildExploreUrl(query, { page: p });

  return (
    <nav
      aria-label="Phân trang"
      className="flex flex-wrap items-center justify-center gap-2 pt-[50px]"
    >
      {page > 1 && (
        <Link
          aria-label="Trang trước"
          className={`${base} border-new-chip text-new-title hover:bg-new-chip`}
          href={href(page - 1)}
        >
          <span aria-hidden className="material-symbols-outlined text-base">
            chevron_left
          </span>
        </Link>
      )}
      {pageList(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-new-paragraph">
            …
          </span>
        ) : (
          <Link
            key={p}
            aria-current={p === page ? "page" : undefined}
            className={`${base} ${
              p === page
                ? "border-new-teal-cta bg-new-teal-cta text-white"
                : "border-new-chip text-new-title hover:bg-new-chip"
            }`}
            href={href(p)}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link
          aria-label="Trang sau"
          className={`${base} border-new-chip text-new-title hover:bg-new-chip`}
          href={href(page + 1)}
        >
          <span aria-hidden className="material-symbols-outlined text-base">
            chevron_right
          </span>
        </Link>
      )}
    </nav>
  );
}
