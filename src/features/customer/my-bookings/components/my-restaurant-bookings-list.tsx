import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  MY_BOOKINGS_PAGE_SIZE,
  type MyBookingsQuery,
} from "../search-params";
import type { MyRestaurantBookingItem } from "../types";
import { MyBookingReviewLink } from "./my-booking-review-link";
import { MyBookingStatusMenu } from "./my-booking-status-menu";
import { MyBookingsPagination } from "./my-bookings-pagination";

const th = "border-b border-r border-new-input-border px-4 py-3 text-left text-base font-medium text-new-title whitespace-nowrap last:border-r-0";
const td = "border-r border-new-input-border px-4 py-3 text-sm text-new-paragraph last:border-r-0";

export function MyRestaurantBookingsList({
  items,
  total,
  query,
  hasAnyBooking,
}: {
  items: MyRestaurantBookingItem[];
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
          {hasAnyBooking ? "Không có đơn nào ở trạng thái này" : "Bạn chưa có đơn đặt bàn nào"}
        </p>
        {!hasAnyBooking && (
          <Link
            href="/explore?kind=restaurant"
            className="rounded bg-new-teal-cta px-5 py-2.5 text-sm font-semibold text-white hover:bg-new-teal-hover"
          >
            Khám phá nhà hàng
          </Link>
        )}
      </div>
    );
  }

  const from = (query.page - 1) * MY_BOOKINGS_PAGE_SIZE + 1;

  return (
    <>
      <div className="overflow-x-auto rounded border border-new-input-border">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="bg-new-section-bg">
              <th className={th}>STT</th>
              <th className={th}>Nhà hàng</th>
              <th className={th}>Ngày & giờ</th>
              <th className={th}>Số khách</th>
              <th className={th}>Trạng thái</th>
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
                        {item.restaurantName}
                      </span>
                      <span className="line-clamp-1 text-xs text-new-paragraph">{item.code}</span>
                    </span>
                  </Link>
                </td>
                <td className={`${td} whitespace-nowrap`}>
                  {formatDate(item.reservationDate)}
                  <span className="block text-xs">
                    {item.endTime ? `${item.startTime} - ${item.endTime}` : item.startTime}
                  </span>
                </td>
                <td className={`${td} whitespace-nowrap`}>{item.guests} khách</td>
                <td className={td}>
                  <MyBookingStatusMenu
                    item={{ ...item, kind: "restaurant", title: item.restaurantName, totalAmount: 0 }}
                  />
                  <MyBookingReviewLink review={item.review} />
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
                  <Link
                    href={`/bookings/${encodeURIComponent(item.code)}`}
                    className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-new-teal-cta hover:underline"
                    aria-label={`Xem đơn ${item.code}`}
                  >
                    <span className="material-symbols-outlined text-lg!">visibility</span>
                    Chi tiết
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
