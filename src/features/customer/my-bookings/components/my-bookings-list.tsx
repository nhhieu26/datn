import Link from "next/link";
import { PaymentBadge, StatusBadge } from "@/features/provider/tour-bookings";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  buildMyBookingsUrl,
  MY_BOOKINGS_PAGE_SIZE,
  type MyBookingsQuery,
} from "../search-params";
import type { MyBookingItem } from "../types";

const th = "border-b border-r border-new-input-border px-4 py-3 text-left text-base font-medium text-new-title whitespace-nowrap last:border-r-0";
const td = "border-r border-new-input-border px-4 py-3 text-sm text-new-paragraph last:border-r-0";

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

export function MyBookingsList({
  items,
  total,
  query,
  hasAnyBooking,
}: {
  items: MyBookingItem[];
  total: number;
  query: MyBookingsQuery;
  hasAnyBooking: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="material-symbols-outlined text-5xl! text-new-placeholder">
          event_busy
        </span>
        <p className="text-base font-medium text-new-title">
          {hasAnyBooking ? "Không có đơn nào ở trạng thái này" : "Bạn chưa có đơn đặt tour nào"}
        </p>
        {!hasAnyBooking && (
          <Link
            href="/tours"
            className="rounded bg-new-teal-cta px-5 py-2.5 text-sm font-semibold text-white hover:bg-new-teal-hover"
          >
            Khám phá tour
          </Link>
        )}
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / MY_BOOKINGS_PAGE_SIZE));
  const from = (query.page - 1) * MY_BOOKINGS_PAGE_SIZE + 1;
  const to = from + items.length - 1;
  const href = (page: number) => buildMyBookingsUrl(query, { page });

  return (
    <>
      <div className="overflow-x-auto rounded border border-new-input-border">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="bg-new-section-bg">
              <th className={th}>STT</th>
              <th className={th}>Tour</th>
              <th className={th}>Khởi hành</th>
              <th className={th}>Số khách</th>
              <th className={th}>Trạng thái</th>
              <th className={th}>Thanh toán</th>
              <th className={th}>Tổng tiền</th>
              <th className={th}>Xem</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.code} className="border-b border-new-input-border last:border-b-0">
                <td className={td}>{String(from + index).padStart(2, "0")}</td>
                <td className={td}>
                  <Link href={`/bookings/${encodeURIComponent(item.code)}`} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.tourImageUrl} alt="" className="size-12 shrink-0 rounded object-cover" />
                    <span className="min-w-0">
                      <span className="line-clamp-1 font-medium text-new-teal-cta hover:underline">
                        {item.tourTitle}
                      </span>
                      <span className="block text-xs text-new-paragraph">{item.code}</span>
                    </span>
                  </Link>
                </td>
                <td className={`${td} whitespace-nowrap`}>{formatDate(item.departureDate)}</td>
                <td className={td}>{item.guests}</td>
                <td className={td}>
                  <StatusBadge status={item.status} />
                  {item.status === "pending_payment" && item.expiresAt && (
                    <span className="mt-1 block text-xs text-new-paragraph">
                      Giữ chỗ đến {formatDate(item.expiresAt)}
                    </span>
                  )}
                </td>
                <td className={td}>
                  <PaymentBadge state={item.paymentState} />
                </td>
                <td className={`${td} whitespace-nowrap font-semibold text-new-title`}>
                  {formatCurrency(item.totalAmount)}
                </td>
                <td className={td}>
                  <Link
                    href={`/bookings/${encodeURIComponent(item.code)}`}
                    className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-new-teal-cta hover:underline"
                    aria-label={`Xem đơn ${item.code}`}
                  >
                    <span className="material-symbols-outlined text-lg!">
                      {item.status === "pending_payment" ? "credit_card" : "visibility"}
                    </span>
                    {item.status === "pending_payment" ? "Thanh toán" : "Chi tiết"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </>
  );
}
