import Link from "next/link";
import type { ReactNode } from "react";
import type { ApprovalStatus, BusinessType } from "@/generated/prisma/client";
import { formatCurrency, formatDateTime, todayIsoDate } from "@/lib/utils";
import {
  moneyIcon,
  StrokeIcon,
  trendClass,
  usersIcon,
} from "@/features/provider/dashboard/components/provider-dashboard";
import { ReportRangeDropdown } from "@/features/provider/reports/components/report-range-dropdown";
import { ReportRefreshButton } from "@/features/provider/reports/components/report-refresh-button";
import {
  ADMIN_REPORT_PATH,
  buildAdminReportExportUrl,
  buildAdminReportUrl,
  type AdminReportQuery,
} from "../search-params";
import { KIND_LABELS } from "../queries";
import type { AdminReportData, AdminReportStatKey } from "../types";
import { AdminRevenueChart, BookingsDonutChart, UserGrowthChart } from "./admin-report-charts";

const statStyle: Record<AdminReportStatKey, { icon: ReactNode; className: string }> = {
  gmv: { icon: moneyIcon, className: "bg-primary-100 text-primary-700" },
  fee: {
    icon: (
      <>
        <path d="M19 5 5 19" />
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </>
    ),
    className: "bg-teal-100 text-teal-700",
  },
  bookings: {
    icon: (
      <>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="m9 15 2 2 4-4" />
      </>
    ),
    className: "bg-yellow-100 text-yellow-700",
  },
  users: { icon: usersIcon, className: "bg-indigo-100 text-indigo-700" },
};

const KIND_DOT: Record<BusinessType, string> = {
  tour: "bg-primary-600",
  hotel: "bg-teal-500",
  restaurant: "bg-amber-500",
};

const KIND_BADGE: Record<BusinessType, string> = {
  tour: "bg-primary-100 text-primary-800",
  hotel: "bg-teal-100 text-teal-800",
  restaurant: "bg-amber-100 text-amber-800",
};

const APPROVAL_ITEMS: { status: ApprovalStatus; label: string; className: string }[] = [
  { status: "pending", label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-800" },
  { status: "approved", label: "Đã duyệt", className: "bg-teal-100 text-teal-800" },
  { status: "rejected", label: "Từ chối", className: "bg-red-100 text-red-800" },
  { status: "not_submitted", label: "Chưa nộp", className: "bg-gray-100 text-gray-800" },
];

const FUNNEL_BAR_CLASSES = ["bg-primary-600", "bg-primary-400", "bg-primary-300"];

const percent = (value: number) => `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;

function Card({
  title,
  description,
  aside,
  children,
  className = "",
}: {
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex min-w-0 flex-col rounded-xl border border-card-line bg-card shadow-2xs ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-4 md:p-5">
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground-1">{description}</p> : null}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Legend({ items }: { items: { label: string; className: string; dashed?: boolean }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground-1">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-x-1.5">
          <span className={`size-2.5 rounded-full ${item.className}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function ShareBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-x-3">
      <div
        className="flex h-1.5 w-full min-w-16 overflow-hidden rounded-full bg-surface"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="rounded-full bg-primary-600" style={{ width: `${value}%` }} />
      </div>
      <span className="w-12 shrink-0 text-end text-xs text-muted-foreground-1">{percent(value)}</span>
    </div>
  );
}

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center text-sm text-muted-foreground-1">
        {message}
      </td>
    </tr>
  );
}

function TableHead({ columns }: { columns: { label: string; end?: boolean }[] }) {
  return (
    <thead className="bg-muted">
      <tr>
        {columns.map((c) => (
          <th
            key={c.label}
            scope="col"
            className={`px-4 py-3 whitespace-nowrap first:ps-5 last:pe-5 ${c.end ? "text-end" : "text-start"}`}
          >
            <span className="text-xs font-semibold text-foreground uppercase">{c.label}</span>
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function AdminReports({ data, query }: { data: AdminReportData; query: AdminReportQuery }) {
  const totalBookings = data.kinds.reduce((sum, k) => sum + k.bookings, 0);

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* Tiêu đề & bộ lọc */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Báo cáo & thống kê</h1>
            <div className="mt-1 flex items-center gap-x-1 text-sm text-muted-foreground-1">
              <span>Số liệu toàn sàn · cập nhật lúc {formatDateTime(data.updatedAt)}</span>
              <ReportRefreshButton />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ReportRangeDropdown
              presetHrefs={{
                "7d": buildAdminReportUrl("7d"),
                "30d": buildAdminReportUrl("30d"),
                "12m": buildAdminReportUrl("12m"),
              }}
              action={ADMIN_REPORT_PATH}
              range={query.range}
              label={data.periodLabel}
              from={query.from}
              to={query.to}
              today={todayIsoDate(data.updatedAt)}
            />
            <a
              href={buildAdminReportExportUrl(query)}
              download
              className="inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-2xs hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden"
            >
              <svg className="size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              Xuất Excel
            </a>
          </div>
        </div>

        {/* Thẻ KPI */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
          {data.stats.map((s) => (
            <div key={s.key} className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
              <div className="p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div className={`flex size-11 items-center justify-center rounded-lg ${statStyle[s.key].className}`}>
                    <StrokeIcon>{statStyle[s.key].icon}</StrokeIcon>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${trendClass(s.trend.up)}`}
                    title="So với kỳ trước"
                  >
                    {s.trend.label}
                  </span>
                </div>
                <p className="mt-4 text-xs tracking-wide text-muted-foreground-1 uppercase">{s.label}</p>
                <h3 className="mt-1 truncate text-xl font-semibold text-foreground sm:text-2xl" title={s.value}>
                  {s.value}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Doanh thu */}
        <Card
          title="Doanh thu nền tảng"
          description={
            <>
              GMV đơn đã thanh toán trong{" "}
              <span className="font-medium text-primary-600">{data.periodLabel}</span>
            </>
          }
          aside={
            <Legend
              items={[
                { label: "GMV", className: "bg-primary-600" },
                { label: "Kỳ trước", className: "bg-gray-400" },
              ]}
            />
          }
        >
          <div className="px-2 pb-2 md:px-3">
            <AdminRevenueChart
              labels={data.revenue.labels}
              values={data.revenue.values}
              previousValues={data.previousRevenue}
              feeValues={data.feeValues}
            />
          </div>
          <div className="mx-4 mb-4 flex items-start gap-x-2 rounded-lg border border-primary-200 bg-primary-50 p-4 text-sm font-medium text-primary-800 md:mx-5 md:mb-5" role="status">
            <svg className="mt-0.5 size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 7h6v6" />
              <path d="m22 7-8.5 8.5-5-5L2 17" />
            </svg>
            {data.insight}
          </div>
        </Card>

        {/* Đơn đặt */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
          <Card title="Đơn đặt theo dịch vụ" description="Tỷ trọng và chất lượng đơn từng loại" className="lg:col-span-2">
            <div className="px-4 pb-4 md:px-5 md:pb-5">
              <BookingsDonutChart kinds={data.kinds} />
              <ul className="mt-4 divide-y divide-card-divider">
                {data.kinds.map((k) => (
                  <li key={k.kind} className="flex items-center gap-x-3 py-2.5 text-sm">
                    <span className={`size-2.5 shrink-0 rounded-full ${KIND_DOT[k.kind]}`} />
                    <span className="font-medium text-foreground">{k.label}</span>
                    <span className="ms-auto text-muted-foreground-1">
                      <span className="font-medium text-foreground">{k.bookings.toLocaleString("vi-VN")}</span> đơn
                      {" · "}
                      <span className="text-teal-600">{percent(k.completionRate)} xong</span>
                      {" · "}
                      <span className="text-red-600">{percent(k.cancellationRate)} hủy</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card title="Phễu đơn đặt" description="Toàn bộ dịch vụ, từ lúc đặt đến khi hoàn thành" className="lg:col-span-3">
            <div className="space-y-5 px-4 pb-4 md:px-5 md:pb-5">
              {data.funnel.map((stage, i) => (
                <div key={stage.label} className="grid items-center gap-x-4 gap-y-1 sm:grid-cols-[11rem_1fr_7rem]">
                  <p className="text-sm font-medium text-foreground">{stage.label}</p>
                  <div
                    className="flex h-7 w-full overflow-hidden rounded-lg bg-surface"
                    role="progressbar"
                    aria-label={stage.label}
                    aria-valuenow={stage.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`rounded-lg transition-all duration-500 ${FUNNEL_BAR_CLASSES[i]}`}
                      style={{ width: `${stage.percent}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground-1 sm:text-end">
                    <span className="font-medium text-foreground">{stage.count.toLocaleString("vi-VN")}</span>
                    {` · ${percent(stage.percent)}`}
                  </p>
                </div>
              ))}

              <div className="grid gap-3 border-t border-card-divider pt-4 sm:grid-cols-3">
                {data.kinds.map((k) => (
                  <div key={k.kind} className="rounded-lg bg-surface p-3">
                    <p className="text-xs text-muted-foreground-1">{k.label}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {k.kind === "restaurant"
                        ? `${k.guests.toLocaleString("vi-VN")} lượt khách`
                        : formatCurrency(k.gmv)}
                    </p>
                    <p className="text-xs text-muted-foreground-1">
                      {k.kind === "restaurant" ? "Không thu phí đặt bàn" : `Hoa hồng ${formatCurrency(k.fee)}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Người dùng & đối tác */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
          <Card
            title="Tăng trưởng người dùng"
            description={`${data.userGrowth.totalCustomers.toLocaleString("vi-VN")} khách hàng và ${data.userGrowth.totalProviders.toLocaleString("vi-VN")} đối tác mới`}
            aside={
              <Legend
                items={[
                  { label: "Khách hàng", className: "bg-primary-600" },
                  { label: "Đối tác", className: "bg-teal-500" },
                ]}
              />
            }
            className="lg:col-span-3"
          >
            <div className="flex flex-1 px-2 pb-4 md:px-3 md:pb-5">
              <UserGrowthChart growth={data.userGrowth} />
            </div>
          </Card>

          <Card title="Hồ sơ đối tác" description="Trạng thái duyệt hiện tại" className="lg:col-span-2">
            <ul className="space-y-3 px-4 pb-4 md:px-5 md:pb-5">
              {APPROVAL_ITEMS.map((item) => {
                const total = Object.values(data.approvals).reduce((a, b) => a + b, 0);
                const count = data.approvals[item.status];
                return (
                  <li key={item.status} className="rounded-lg border border-card-line p-3">
                    <div className="flex items-center justify-between gap-x-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.className}`}>
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-foreground">{count.toLocaleString("vi-VN")}</span>
                    </div>
                    <div className="mt-2">
                      <ShareBar value={total ? Math.round((count / total) * 1000) / 10 : 0} label={item.label} />
                    </div>
                  </li>
                );
              })}
              {data.approvals.pending > 0 ? (
                <li>
                  <Link
                    href="/admin/profile-approval"
                    className="inline-flex items-center gap-x-1 text-sm font-medium text-primary-600 hover:underline focus:underline focus:outline-hidden"
                  >
                    Duyệt {data.approvals.pending} hồ sơ đang chờ
                    <svg className="size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </li>
              ) : null}
            </ul>
          </Card>
        </div>

        {/* Bảng xếp hạng */}
        <div className="grid gap-4 sm:gap-6 xl:grid-cols-5">
          <Card title="Top đối tác" description="Xếp theo GMV trong kỳ" className="xl:col-span-3">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-table-line">
                <TableHead
                  columns={[
                    { label: "#" },
                    { label: "Đối tác" },
                    { label: "Đơn", end: true },
                    { label: "GMV", end: true },
                    { label: "Tỷ trọng" },
                  ]}
                />
                <tbody className="divide-y divide-table-line">
                  {data.topProviders.length === 0 ? (
                    <EmptyRow colSpan={5} message="Chưa có đơn đặt trong kỳ này." />
                  ) : (
                    data.topProviders.map((p, i) => (
                      <tr key={p.id} className="hover:bg-layer-hover">
                        <td className="px-4 py-3 ps-5 text-sm font-semibold text-muted-foreground-1">{i + 1}</td>
                        <td className="min-w-48 px-4 py-3">
                          <p className="text-sm font-medium text-foreground">{p.name}</p>
                          <span className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${KIND_BADGE[p.kind]}`}>
                            {KIND_LABELS[p.kind]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-end text-sm text-foreground">{p.bookings.toLocaleString("vi-VN")}</td>
                        <td className="px-4 py-3 text-end text-sm whitespace-nowrap">
                          <p className="font-medium text-foreground">{formatCurrency(p.gmv)}</p>
                          <p className="text-xs text-muted-foreground-1">Phí {formatCurrency(p.fee)}</p>
                        </td>
                        <td className="min-w-36 px-4 py-3 pe-5">
                          <ShareBar value={p.share} label={`Tỷ trọng GMV của ${p.name}`} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Top tỉnh/thành" description={`Theo số đơn · ${totalBookings.toLocaleString("vi-VN")} đơn toàn sàn`} className="xl:col-span-2">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-table-line">
                <TableHead columns={[{ label: "#" }, { label: "Tỉnh/thành" }, { label: "Đơn", end: true }, { label: "Tỷ trọng" }]} />
                <tbody className="divide-y divide-table-line">
                  {data.topProvinces.length === 0 ? (
                    <EmptyRow colSpan={4} message="Chưa có đơn đặt trong kỳ này." />
                  ) : (
                    data.topProvinces.map((p, i) => (
                      <tr key={p.id} className="hover:bg-layer-hover">
                        <td className="px-4 py-3 ps-5 text-sm font-semibold text-muted-foreground-1">{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-foreground">{p.name}</td>
                        <td className="px-4 py-3 text-end text-sm text-foreground">{p.bookings.toLocaleString("vi-VN")}</td>
                        <td className="min-w-36 px-4 py-3 pe-5">
                          <ShareBar value={p.share} label={`Tỷ trọng đơn của ${p.name}`} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
