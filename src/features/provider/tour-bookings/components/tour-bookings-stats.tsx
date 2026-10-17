import { formatCurrency } from "@/lib/utils";
import type { TourBookingsSummary } from "../types";
import { BookingIcon, type BookingIconName } from "./booking-icon";

type StatCard = {
  label: string;
  value: string;
  hint: string;
  icon: BookingIconName;
  iconClass: string;
};

/** Thẻ thống kê phong cách Preline cho trang danh sách đơn tour. */
export function TourBookingsStats({
  summary,
}: {
  summary: TourBookingsSummary;
}) {
  const cards: StatCard[] = [
    {
      label: "Tổng đơn đặt",
      value: String(summary.total),
      hint: "Toàn bộ đơn đặt tour",
      icon: "ticket",
      iconClass: "bg-primary-100 text-primary-700",
    },
    {
      label: "Chờ thanh toán",
      value: String(summary.awaitingPayment),
      hint: "Khách chưa hoàn tất",
      icon: "clock",
      iconClass: "bg-yellow-100 text-yellow-700",
    },
    {
      label: "Đã thanh toán / Xác nhận",
      value: String(summary.confirmed),
      hint: "Đơn đang hiệu lực",
      icon: "check",
      iconClass: "bg-teal-100 text-teal-700",
    },
    {
      label: "Doanh thu thực nhận",
      value: formatCurrency(summary.revenue),
      hint: "Sau phí nền tảng",
      icon: "wallet",
      iconClass: "bg-blue-100 text-blue-700",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs"
        >
          <div className="flex gap-x-4 p-4 md:p-5">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}
            >
              <BookingIcon name={card.icon} className="size-5" />
            </div>
            <div className="min-w-0 grow">
              <p className="truncate text-xs tracking-wide text-muted-foreground-1 uppercase">
                {card.label}
              </p>
              <h3 className="mt-1 truncate text-xl font-medium text-foreground sm:text-2xl">
                {card.value}
              </h3>
              <p className="text-xs text-muted-foreground-1">{card.hint}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
