import Link from "next/link";
import {
  buildMyBookingsUrl,
  MY_BOOKINGS_PAGE_SIZE,
  type MyBookingsQuery,
} from "../search-params";

function pageList(page: number, totalPages: number): (number | "gap")[] {
  const pages = new Set(
    [1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages),
  );
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

const pageBtn =
  "inline-flex size-9 items-center justify-center rounded border text-sm font-medium transition-colors";

export function MyBookingsPagination({
  total,
  count,
  query,
}: {
  total: number;
  /** Số đơn đang hiển thị ở trang hiện tại. */
  count: number;
  query: MyBookingsQuery;
}) {
  const totalPages = Math.max(1, Math.ceil(total / MY_BOOKINGS_PAGE_SIZE));
  const from = (query.page - 1) * MY_BOOKINGS_PAGE_SIZE + 1;
  const to = from + count - 1;
  const href = (page: number) => buildMyBookingsUrl(query, { page });

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-new-paragraph">
        Hiển thị {from}–{to} trong {total} đơn
      </p>
      {totalPages > 1 && (
        <nav aria-label="Phân trang" className="flex items-center gap-1.5">
          {query.page > 1 && (
            <Link aria-label="Trang trước" scroll={false} href={href(query.page - 1)} className={`${pageBtn} border-new-chip text-new-title hover:bg-new-chip`}>
              <span aria-hidden className="material-symbols-outlined text-base">chevron_left</span>
            </Link>
          )}
          {pageList(query.page, totalPages).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className="px-1 text-new-paragraph">…</span>
            ) : (
              <Link
                key={p}
                scroll={false}
                href={href(p)}
                aria-current={p === query.page ? "page" : undefined}
                className={`${pageBtn} ${
                  p === query.page
                    ? "border-new-teal-cta bg-new-teal-cta text-white"
                    : "border-new-chip text-new-title hover:bg-new-chip"
                }`}
              >
                {p}
              </Link>
            ),
          )}
          {query.page < totalPages && (
            <Link aria-label="Trang sau" scroll={false} href={href(query.page + 1)} className={`${pageBtn} border-new-chip text-new-title hover:bg-new-chip`}>
              <span aria-hidden className="material-symbols-outlined text-base">chevron_right</span>
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
