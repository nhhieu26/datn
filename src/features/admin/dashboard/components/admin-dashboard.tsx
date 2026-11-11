import Link from "next/link";
import type { ReactNode } from "react";
import { formatCurrency, formatDate, formatDateTime, formatRelativeTime } from "@/lib/utils";
import { StrokeIcon, trendClass, usersIcon } from "@/features/provider/dashboard/components/provider-dashboard";
import { getBookingStatusMeta } from "@/features/provider/tour-bookings/utils";
import {
  AdminRevenueChart,
  BookingsDonutChart,
  KIND_BADGE,
  KIND_DOT,
  statStyle,
} from "@/features/admin/reports/components";
import { buildAdminReportUrl, KIND_LABELS } from "@/features/admin/reports";
import { RoleBadge, UserAvatar, UserStatusBadge } from "@/features/admin/users/components/users-shared";
import { DASHBOARD_RANGE } from "../queries";
import type { AdminDashboardData } from "../types";

const REPORT_HREF = buildAdminReportUrl(DASHBOARD_RANGE);

function Card({
  title,
  description,
  aside,
  footer,
  children,
  className = "",
}: {
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  footer?: { href: string; label: string };
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
      <div className="flex-1">{children}</div>
      {footer ? (
        <div className="border-t border-card-divider px-4 py-3 md:px-5">
          <Link
            href={footer.href}
            className="inline-flex items-center gap-x-1 text-sm font-medium text-primary-600 hover:underline focus:underline focus:outline-hidden"
          >
            {footer.label}
            <svg className="size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="px-4 pb-6 text-sm text-muted-foreground-1 md:px-5">{children}</p>;
}

const pendingIcon = (
  <>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </>
);

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  const { report, userSummary } = data;
  const pendingCount = report.approvals.pending;

  const userTiles = [
    { label: "Tổng tài khoản", value: userSummary.total, className: "text-foreground" },
    { label: "Khách hàng", value: userSummary.customers, className: "text-foreground" },
    { label: "Đối tác", value: userSummary.providers, className: "text-primary-600" },
    { label: "Bị khóa", value: userSummary.banned, className: "text-red-600" },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* Tiêu đề */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Tổng quan</h1>
            <p className="mt-1 text-sm text-muted-foreground-1">
              Hoạt động toàn sàn trong <span className="font-medium text-primary-600">{report.periodLabel}</span>
              {" · "}cập nhật lúc {formatDateTime(report.updatedAt)}
            </p>
          </div>
          <Link
            href={REPORT_HREF}
            className="inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-2xs hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden"
          >
            <svg className="size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v16a2 2 0 0 0 2 2h16" />
              <path d="M18 17V9" />
              <path d="M13 17V5" />
              <path d="M8 17v-3" />
            </svg>
            Xem báo cáo chi tiết
          </Link>
        </div>

        {/* Cảnh báo hồ sơ chờ duyệt */}
        {pendingCount > 0 ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800" role="alert">
            <svg className="size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <span>
              Có <span className="font-semibold">{pendingCount.toLocaleString("vi-VN")}</span> hồ sơ đối tác đang chờ duyệt.
            </span>
            <Link href="/admin/profile-approval" className="ms-auto font-semibold underline-offset-2 hover:underline focus:underline focus:outline-hidden">
              Duyệt ngay
            </Link>
          </div>
        ) : null}

        {/* Thẻ KPI */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
          {report.stats.map((s) => (
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

        {/* Biểu đồ */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <Card
            title="Doanh thu nền tảng"
            description={report.insight}
            className="lg:col-span-2"
            aside={
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground-1">
                <span className="inline-flex items-center gap-x-1.5">
                  <span className="size-2.5 rounded-full bg-primary-600" />
                  GMV
                </span>
                <span className="inline-flex items-center gap-x-1.5">
                  <span className="size-2.5 rounded-full bg-gray-400" />
                  Kỳ trước
                </span>
              </div>
            }
          >
            <div className="px-2 pb-2 md:px-3">
              <AdminRevenueChart
                labels={report.revenue.labels}
                values={report.revenue.values}
                previousValues={report.previousRevenue}
                feeValues={report.feeValues}
              />
            </div>
          </Card>

          <Card title="Đơn đặt theo dịch vụ" description="Tỷ trọng đơn từng loại trong kỳ">
            <div className="px-4 pb-4 md:px-5 md:pb-5">
              <BookingsDonutChart kinds={report.kinds} />
              <ul className="mt-4 divide-y divide-card-divider">
                {report.kinds.map((k) => (
                  <li key={k.kind} className="flex items-center gap-x-3 py-2.5 text-sm">
                    <span className={`size-2.5 shrink-0 rounded-full ${KIND_DOT[k.kind]}`} />
                    <span className="font-medium text-foreground">{k.label}</span>
                    <span className="ms-auto text-muted-foreground-1">
                      <span className="font-medium text-foreground">{k.bookings.toLocaleString("vi-VN")}</span> đơn
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* Cần xử lý + người dùng */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Card
            title="Hồ sơ đối tác chờ duyệt"
            description="Hồ sơ gửi gần nhất cần được xem xét"
            aside={
              <span className="inline-flex items-center gap-x-1.5 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
                {pendingCount.toLocaleString("vi-VN")} chờ duyệt
              </span>
            }
            footer={{ href: "/admin/profile-approval", label: "Xem tất cả hồ sơ" }}
          >
            {data.pendingProfiles.length ? (
              <ul className="divide-y divide-card-divider border-t border-card-divider">
                {data.pendingProfiles.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/profile-approval/${p.id}`}
                      className="flex items-center gap-x-3 px-4 py-3 hover:bg-muted-hover focus:bg-muted-focus focus:outline-hidden md:px-5"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
                        <StrokeIcon>{pendingIcon}</StrokeIcon>
                      </span>
                      <div className="min-w-0 grow">
                        <p className="truncate text-sm font-medium text-foreground">{p.businessName}</p>
                        <p className="truncate text-sm text-muted-foreground-1">
                          {p.ownerName} · gửi {formatRelativeTime(p.submittedAt)}
                        </p>
                      </div>
                      <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${KIND_BADGE[p.businessType]}`}>
                        {KIND_LABELS[p.businessType]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState>Không có hồ sơ nào đang chờ duyệt.</EmptyState>
            )}
          </Card>

          <Card
            title="Người dùng"
            description="Tổng quan tài khoản và đăng ký mới nhất"
            aside={
              <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <StrokeIcon>{usersIcon}</StrokeIcon>
              </span>
            }
            footer={{ href: "/admin/users", label: "Quản lý người dùng" }}
          >
            <div className="grid grid-cols-2 gap-px border-y border-card-divider bg-card-divider sm:grid-cols-4">
              {userTiles.map((t) => (
                <div key={t.label} className="bg-card px-4 py-3 md:px-5">
                  <p className="text-xs tracking-wide text-muted-foreground-1 uppercase">{t.label}</p>
                  <p className={`mt-1 text-lg font-semibold ${t.className}`}>{t.value.toLocaleString("vi-VN")}</p>
                </div>
              ))}
            </div>
            {data.recentUsers.length ? (
              <ul className="divide-y divide-card-divider">
                {data.recentUsers.map((u) => (
                  <li key={u.id}>
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="flex items-center gap-x-3 px-4 py-3 hover:bg-muted-hover focus:bg-muted-focus focus:outline-hidden md:px-5"
                    >
                      <UserAvatar name={u.fullname} />
                      <div className="min-w-0 grow">
                        <p className="truncate text-sm font-medium text-foreground">{u.fullname}</p>
                        <p className="truncate text-sm text-muted-foreground-1">{u.email}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <RoleBadge role={u.role} />
                        {u.status !== "active" ? <UserStatusBadge status={u.status} /> : (
                          <span className="text-xs text-muted-foreground-1">{formatRelativeTime(u.createdAt)}</span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState>Chưa có tài khoản nào.</EmptyState>
            )}
          </Card>
        </div>

        {/* Đơn đặt gần đây */}
        <Card
          title="Đơn đặt gần đây"
          description="Các đơn mới nhất trên toàn sàn"
          footer={{ href: REPORT_HREF, label: "Xem báo cáo đơn đặt" }}
        >
          <div className="overflow-x-auto border-t border-card-divider">
            <table className="min-w-full divide-y divide-table-line">
              <thead className="bg-muted">
                <tr>
                  {[
                    { label: "Mã đơn" },
                    { label: "Dịch vụ" },
                    { label: "Khách hàng" },
                    { label: "Đối tác" },
                    { label: "Ngày sử dụng" },
                    { label: "Trạng thái" },
                    { label: "Số tiền", end: true },
                  ].map((c) => (
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
              <tbody className="divide-y divide-table-line">
                {data.recentBookings.map((b) => {
                  const status = getBookingStatusMeta(b.status);
                  return (
                    <tr key={`${b.type}-${b.id}`} className="hover:bg-muted-hover">
                      <td className="px-4 py-3 ps-5 whitespace-nowrap">
                        <p className="text-sm font-medium text-foreground">{b.code}</p>
                        <p className="text-xs text-muted-foreground-1">{formatRelativeTime(b.createdAt)}</p>
                      </td>
                      <td className="max-w-64 px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${KIND_BADGE[b.type]}`}>
                          {KIND_LABELS[b.type]}
                        </span>
                        <p className="mt-1 truncate text-sm text-foreground" title={b.title}>{b.title}</p>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-foreground">{b.customerName}</td>
                      <td className="max-w-48 truncate px-4 py-3 text-sm text-muted-foreground-1" title={b.providerName}>
                        {b.providerName}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-muted-foreground-1">{formatDate(b.serviceDate)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 pe-5 text-end text-sm font-medium whitespace-nowrap text-foreground">
                        {b.totalAmount === null ? `${b.guests} khách` : formatCurrency(b.totalAmount)}
                      </td>
                    </tr>
                  );
                })}
                {!data.recentBookings.length && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-muted-foreground-1">
                      Chưa có đơn đặt nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
