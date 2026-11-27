import { ApprovalIcon } from "@/features/admin/profile-approval/components/approval-icon";
import Link from "next/link";

function pageList(page: number, totalPages: number): (number | "gap")[] {
  const pages = [
    ...new Set(
      [1, totalPages, page - 1, page, page + 1].filter(
        (p) => p >= 1 && p <= totalPages,
      ),
    ),
  ].sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

const pageButtonClass =
  "inline-flex min-h-9.5 min-w-9.5 items-center justify-center rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-muted-hover focus:bg-muted-focus focus:outline-hidden";

export function UsersPagination({
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
    <nav aria-label="Phân trang" className="flex items-center gap-x-1">
      {page > 1 ? (
        <Link
          aria-label="Trang trước"
          className={pageButtonClass}
          href={href(page - 1)}
        >
          <ApprovalIcon name="chevronLeft" className="size-3.5" />
        </Link>
      ) : null}
      {pageList(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground-1">
            …
          </span>
        ) : p === page ? (
          <span
            key={p}
            aria-current="page"
            className="flex min-h-9.5 min-w-9.5 items-center justify-center rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground"
          >
            {p}
          </span>
        ) : (
          <Link key={p} className={pageButtonClass} href={href(p)}>
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link
          aria-label="Trang sau"
          className={pageButtonClass}
          href={href(page + 1)}
        >
          <ApprovalIcon name="chevronRight" className="size-3.5" />
        </Link>
      ) : null}
    </nav>
  );
}
