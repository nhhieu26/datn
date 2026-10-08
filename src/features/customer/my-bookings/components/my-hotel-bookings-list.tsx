import Link from "next/link";
import { PaymentBadge } from "@/features/provider/tour-bookings";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  MY_BOOKINGS_PAGE_SIZE,
  type MyBookingsQuery,
} from "../search-params";
import type { MyHotelBookingItem } from "../types";
import { MyBookingReviewLink } from "./my-booking-review-link";
import { MyBookingStatusMenu } from "./my-booking-status-menu";
import { MyBookingsPagination } from "./my-bookings-pagination";

const th = "border-b border-r border-new-input-border px-4 py-3 text-left text-base font-medium text-new-title whitespace-nowrap last:border-r-0";
const td = "border-r border-new-input-border px-4 py-3 text-sm text-new-paragraph last:border-r-0";

export function MyHotelBookingsList({
  items,
  total,
  query,
  hasAnyBooking,
}: {
  items: MyHotelBookingItem[];
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
          {hasAnyBooking ? "Không có đơn nào ở trạng thái này" : "Bạn chưa có đơn đặt phòng nào"}
        </p>
        {!hasAnyBooking && (
          <Link
            href="/hotels"
            className="rounded bg-new-teal-cta px-5 py-2.5 text-sm font-semibold text-white hover:bg-new-teal-hover"
          >
            Khám phá khách sạn
          </Link>
        )}
      </div>
    );
  }

  const from = (query.page - 1) * MY_BOOKINGS_PAGE_SIZE + 1;

  return (
    <>
      <div className="overflow-x-auto rounded border border-new-input-border">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-new-section-bg">
              <th className={th}>STT</th>
              <th className={th}>Khách sạn</th>
              <th className={th}>Nhận – trả phòng</th>
              <th className={th}>Phòng / khách</th>
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
                    <img src={item.imageUrl} alt="" className="size-12 shrink-0 rounded object-cover" />
                    <span className="min-w-0">
                      <span className="line-clamp-1 font-medium text-new-teal-cta hover:underline">
                        {item.hotelName}
                      </span>
                      <span className="line-clamp-1 text-xs text-new-paragraph">
                        {item.roomName} · {item.code}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className={`${td} whitespace-nowrap`}>
                  {formatDate(item.checkInDate)} – {formatDate(item.checkOutDate)}
                  <span className="block text-xs">{item.nights} đêm</span>
                </td>
                <td className={`${td} whitespace-nowrap`}>
                  {item.roomQuantity} phòng · {item.guests} khách
                </td>
                <td className={td}>
                  <MyBookingStatusMenu
                    item={{ ...item, kind: "hotel", title: `${item.hotelName} · ${item.roomName}` }}
                  />
                  <MyBookingReviewLink review={item.review} />
                  {item.status === "pending_payment" && item.expiresAt && (
                    <span className="mt-1 block text-xs text-new-paragraph">
                      Giữ phòng đến {formatDate(item.expiresAt)}
                    </span>
                  )}
                  {item.cancelReason && (
                    <span
                      title={item.cancelReason}
                      className="mt-1 line-clamp-2 block max-w-[220px] text-xs text-rose-700"
                    >
                      Lý do: {item.cancelReason}
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

      <MyBookingsPagination total={total} count={items.length} query={query} />
    </>
  );
}
