import Link from "next/link";
import type { ReactNode } from "react";
import type { BusinessType } from "@/generated/prisma/client";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { getBookingStatusMeta } from "@/features/provider/tour-bookings/utils";
import { buildDashboardUrl, type DashboardRange } from "../search-params";
import type { ActivityType, DashboardData, DashboardStat } from "../types";
import { RevenueChart } from "./revenue-chart";

const SERVICE_SLUGS: Record<BusinessType, string> = {
  tour: "tours",
  hotel: "hotels",
  restaurant: "restaurants",
};

const RANGE_TABS: { value: DashboardRange; label: string }[] = [
  { value: "month", label: "Tháng" },
  { value: "week", label: "Tuần" },
  { value: "day", label: "Ngày" },
];

const moneyIcon = (
  <>
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </>
);

const clipboardIcon = (
  <>
    <rect width="8" height="4" x="8" y="2" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </>
);

const starIcon = (
  <path d="M11.5 2.3a.5.5 0 0 1 1 0l2.4 5 5.4.8a.5.5 0 0 1 .3.9l-3.9 3.9.9 5.5a.5.5 0 0 1-.7.5L12 16.3l-4.9 2.6a.5.5 0 0 1-.7-.5l.9-5.5-3.9-3.9a.5.5 0 0 1 .3-.9l5.4-.8Z" />
);

const usersIcon = (
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);

const statStyle: Record<DashboardStat["key"], { iconClass: string; icon: ReactNode }> = {
  bookings: { iconClass: "bg-primary-100 text-primary-700", icon: clipboardIcon },
  primary: { iconClass: "bg-teal-100 text-teal-700", icon: moneyIcon },
  services: {
    iconClass: "bg-yellow-100 text-yellow-700",
    icon: (
      <>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  rating: { iconClass: "bg-red-100 text-red-700", icon: starIcon },
};

const activityStyle: Record<ActivityType, { cls: string; icon: ReactNode }> = {
  booking: { cls: "bg-primary-100 text-primary-700", icon: clipboardIcon },
  cancel: {
    cls: "bg-red-100 text-red-700",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </>
    ),
  },
  review: { cls: "bg-yellow-100 text-yellow-700", icon: starIcon },
  refund: { cls: "bg-red-100 text-red-700", icon: moneyIcon },
  payment: { cls: "bg-teal-100 text-teal-700", icon: moneyIcon },
};

function trendClass(up: boolean | null) {
  if (up === true) return "bg-teal-100 text-teal-800";
  if (up === false) return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
}

function StrokeIcon({ children }: { children: ReactNode }) {
  return (
    <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function ProviderDashboard({
  data,
  range,
}: {
  data: DashboardData;
  range: DashboardRange;
}) {
  const slug = SERVICE_SLUGS[data.kind];
  const bookingsHref = `/provider/bookings/${slug}`;
  const isRestaurant = data.kind === "restaurant";

  return (
    <main className="flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-6 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Tổng quan</h1>
          <p className="text-sm text-muted-foreground-1">Theo dõi hoạt động kinh doanh của bạn</p>
        </div>
        <Link
          href={`/provider/${slug}/create`}
          className="inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden"
        >
          + Tạo dịch vụ mới
        </Link>
      </div>

      {/* Thẻ thống kê */}
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {data.stats.map((s) => (
          <div key={s.key} className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
            <div className="p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div className={`flex size-11 items-center justify-center rounded-lg ${statStyle[s.key].iconClass}`}>
                  <StrokeIcon>{s.key === "primary" && isRestaurant ? usersIcon : statStyle[s.key].icon}</StrokeIcon>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${trendClass(s.trend.up)}`}
                  title={s.key === "services" ? "Mới trong tháng này" : s.key === "rating" ? undefined : "So với tháng trước"}
                >
                  {s.trend.label}
                </span>
              </div>
              <p className="mt-4 text-xs tracking-wide text-muted-foreground-1 uppercase">{s.label}</p>
              <h3 className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Biểu đồ + hoạt động */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col rounded-xl border border-card-line bg-card shadow-2xs lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3 p-4 md:p-5">
            <div>
              <h2 className="font-semibold text-foreground">
                {isRestaurant ? "Phân tích lượt khách" : "Phân tích doanh thu"}
              </h2>
              <p className="text-sm text-muted-foreground-1">Hiệu suất kinh doanh theo thời gian</p>
            </div>
            <div className="inline-flex rounded-lg border border-layer-line bg-layer p-0.5 text-sm">
              {RANGE_TABS.map((t) => (
                <Link
                  key={t.value}
                  href={buildDashboardUrl(data.kind, t.value)}
                  scroll={false}
                  aria-current={t.value === range ? "true" : undefined}
                  className={`rounded-md px-3 py-1.5 font-medium ${t.value === range ? "bg-primary text-primary-foreground" : "text-layer-foreground hover:bg-layer-hover"}`}
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="px-2 pb-4 md:px-3 md:pb-5">
            <RevenueChart chart={data.chart} />
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
          <div className="flex items-center justify-between p-4 md:p-5">
            <h2 className="font-semibold text-foreground">Hoạt động gần đây</h2>
          </div>
          {data.activities.length ? (
            <ul className="divide-y divide-card-divider">
              {data.activities.map((a) => (
                <li key={`${a.type}-${a.title}-${a.at.getTime()}`} className="flex gap-x-3 px-4 py-3 md:px-5">
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${activityStyle[a.type].cls}`}>
                    <StrokeIcon>{activityStyle[a.type].icon}</StrokeIcon>
                  </span>
                  <div className="min-w-0 grow">
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <p className="truncate text-sm text-muted-foreground-1">{a.desc}</p>
                    <span className="text-xs text-muted-foreground-1">{formatRelativeTime(a.at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 pb-6 text-sm text-muted-foreground-1 md:px-5">Chưa có hoạt động nào.</p>
          )}
        </div>
      </div>

      {/* Đơn sắp tới */}
      <div className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
        <div className="p-4 md:p-5">
          <h2 className="font-semibold text-foreground">Đơn đặt sắp tới</h2>
          <p className="text-sm text-muted-foreground-1">Các đơn còn hiệu lực có ngày sử dụng gần nhất</p>
        </div>
        <div className="overflow-x-auto border-t border-card-divider">
          <table className="min-w-full divide-y divide-table-line text-start">
            <thead className="bg-surface">
              <tr>
                {["Mã đơn", "Khách hàng", "Dịch vụ", "Ngày", "Trạng thái", isRestaurant ? "Số khách" : "Số tiền", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-start text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-table-line">
              {data.upcoming.map((b) => {
                const status = getBookingStatusMeta(b.status);
                return (
                  <tr key={b.code} className="hover:bg-surface-hover">
                    <td className="px-5 py-3 text-sm font-medium whitespace-nowrap text-foreground">{b.code}</td>
                    <td className="px-5 py-3 text-sm whitespace-nowrap text-muted-foreground-1">{b.customer}</td>
                    <td className="max-w-xs truncate px-5 py-3 text-sm text-foreground">{b.service}</td>
                    <td className="px-5 py-3 text-sm whitespace-nowrap text-muted-foreground-1">{formatDate(b.date)}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium whitespace-nowrap text-foreground">{b.amount}</td>
                    <td className="px-5 py-3 text-end whitespace-nowrap">
                      <Link href={`${bookingsHref}/${b.code}`} className="text-sm font-medium text-primary hover:underline">
                        Quản lý
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {!data.upcoming.length && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground-1">
                    Chưa có đơn đặt sắp tới.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-card-divider p-4 text-center">
          <Link href={bookingsHref} className="text-sm font-medium text-primary hover:underline">
            Xem tất cả đơn đặt
          </Link>
        </div>
      </div>
    </main>
  );
}
