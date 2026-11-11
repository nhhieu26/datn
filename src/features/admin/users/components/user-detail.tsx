"use client";

import {
  ApprovalIcon,
  type ApprovalIconName,
} from "@/features/admin/profile-approval/components/approval-icon";
import {
  BusinessBadge,
  layerButtonClass,
  primaryButtonClass,
  StatusBadge,
} from "@/features/admin/profile-approval/components/approval-shared";
import { SettingsToast } from "@/features/admin/settings/components/settings-shared";
import { getBookingStatusMeta } from "@/features/provider/tour-bookings/utils";
import {
  formatCurrency,
  formatDate,
  formatEntityCode,
  formatTime,
} from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { USERS_PATH } from "../search-params";
import type { AdminUserDetail } from "../types";
import { UserStatusModal } from "./user-status-modal";
import {
  canToggleStatus,
  RoleBadge,
  UserAvatar,
  UserStatusBadge,
} from "./users-shared";

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ApprovalIconName;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
      <div className="flex items-center gap-x-2 border-b border-card-divider px-5 py-3">
        <ApprovalIcon name={icon} className="size-4 text-muted-foreground-1" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:gap-x-4">
      <dt className="text-sm text-muted-foreground-1">{label}</dt>
      <dd className="min-w-0 text-sm font-medium break-words text-foreground">
        {children}
      </dd>
    </div>
  );
}

export function UserDetail({
  user,
  currentAdminId,
}: {
  user: AdminUserDetail;
  currentAdminId: string;
}) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [toast, setToast] = useState("");

  const isBanned = user.status === "banned";
  const totalBookings =
    user.counts.tourBookings +
    user.counts.hotelBookings +
    user.counts.restaurantBookings;

  const stats = [
    { label: "Đặt tour", value: user.counts.tourBookings },
    { label: "Đặt phòng", value: user.counts.hotelBookings },
    { label: "Đặt bàn", value: user.counts.restaurantBookings },
    { label: "Đánh giá", value: user.counts.reviews },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        {toast ? (
          <SettingsToast message={toast} onClose={() => setToast("")} />
        ) : null}

        <div className="grid gap-3 md:flex md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-x-4">
            <UserAvatar className="size-14 text-xl" name={user.fullname} />
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold text-foreground">
                {user.fullname}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-md bg-surface px-2 py-0.5 font-mono text-xs font-medium text-surface-foreground">
                  {formatEntityCode("US", user.id)}
                </span>
                <RoleBadge role={user.role} />
                <UserStatusBadge status={user.status} />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 self-start md:self-auto">
            <Link className={`px-3 py-2 ${layerButtonClass}`} href={USERS_PATH}>
              <ApprovalIcon name="arrowLeft" />
              Quay lại danh sách
            </Link>
            {canToggleStatus(user, currentAdminId) ? (
              isBanned ? (
                <button
                  className={primaryButtonClass}
                  onClick={() => setIsConfirming(true)}
                  type="button"
                >
                  <ApprovalIcon name="check" />
                  Mở khoá tài khoản
                </button>
              ) : (
                <button
                  className="inline-flex items-center justify-center gap-x-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 focus:bg-red-100 focus:outline-hidden"
                  onClick={() => setIsConfirming(true)}
                  type="button"
                >
                  <ApprovalIcon name="ban" />
                  Khoá tài khoản
                </button>
              )
            ) : null}
          </div>
        </div>

        {isBanned ? (
          <div
            className="flex rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            <ApprovalIcon name="alert" className="mt-0.5 size-4" />
            <p className="ms-3">
              Tài khoản này đang bị khoá và không thể đăng nhập.
            </p>
          </div>
        ) : null}

        <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            <Card title="Thông tin tài khoản" icon="user">
              <dl className="space-y-3">
                <InfoRow label="Họ tên">{user.fullname}</InfoRow>
                <InfoRow label="Email">
                  <a
                    className="text-primary-600 hover:underline focus:underline focus:outline-hidden"
                    href={`mailto:${user.email}`}
                  >
                    {user.email}
                  </a>
                </InfoRow>
                <InfoRow label="Số điện thoại">{user.phone}</InfoRow>
                <InfoRow label="Vai trò">
                  <RoleBadge role={user.role} />
                </InfoRow>
                <InfoRow label="Trạng thái">
                  <UserStatusBadge status={user.status} />
                </InfoRow>
                {user.role === "customer" ? (
                  <InfoRow label="Khảo sát sở thích">
                    {user.onboardingCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"}
                  </InfoRow>
                ) : null}
              </dl>
            </Card>

            {user.role === "provider" ? (
              <Card title="Hồ sơ đối tác" icon="file">
                {user.providerProfiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground-1">
                    Tài khoản này chưa tạo hồ sơ đối tác nào.
                  </p>
                ) : (
                  <ul className="divide-y divide-card-divider rounded-lg border border-card-line">
                    {user.providerProfiles.map((profile) => (
                      <li
                        className="flex items-center justify-between gap-x-3 px-4 py-3"
                        key={profile.id}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {profile.businessName}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <BusinessBadge type={profile.businessType} />
                            {profile.approvalStatus === "not_submitted" ? (
                              <span className="inline-flex rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-surface-foreground">
                                Chưa nộp
                              </span>
                            ) : (
                              <StatusBadge status={profile.approvalStatus} />
                            )}
                          </div>
                        </div>
                        {profile.approvalStatus !== "not_submitted" ? (
                          <Link
                            aria-label={`Xem hồ sơ ${profile.businessName}`}
                            className={`size-8 shrink-0 ${layerButtonClass}`}
                            href={`/admin/profile-approval/${profile.id}`}
                          >
                            <ApprovalIcon name="eye" className="size-3.5" />
                          </Link>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ) : null}

            {user.role !== "admin" ? (
              <Card title="Booking gần nhất" icon="calendar">
                <p className="mb-4 text-sm text-muted-foreground-1">
                  {user.role === "customer"
                    ? "Các lượt đặt dịch vụ mới nhất của khách hàng này."
                    : "Các lượt đặt mới nhất mà hồ sơ của đối tác này nhận được."}
                </p>
                {user.recentBookings.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-card-line px-4 py-6 text-center text-sm text-muted-foreground-1">
                    Chưa có booking nào.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-card-line">
                    <table className="min-w-full divide-y divide-table-line">
                      <thead className="bg-muted">
                        <tr>
                          {[
                            "Booking",
                            user.role === "customer" ? "Đối tác" : "Khách đặt",
                            "Ngày sử dụng",
                            "Tổng tiền",
                            "Trạng thái",
                          ].map((label) => (
                            <th
                              className="px-4 py-2.5 text-start text-xs font-semibold whitespace-nowrap text-foreground uppercase"
                              key={label}
                              scope="col"
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-table-line">
                        {user.recentBookings.map((booking) => {
                          const status = getBookingStatusMeta(booking.status);
                          return (
                            <tr key={`${booking.type}-${booking.id}`}>
                              <td className="min-w-56 px-4 py-3 align-middle">
                                <p className="max-w-64 truncate text-sm font-medium text-foreground">
                                  {booking.title}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                  <BusinessBadge type={booking.type} />
                                  <span className="font-mono text-xs text-muted-foreground-1">
                                    {booking.code}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 align-middle">
                                <span className="block max-w-40 truncate text-sm text-foreground">
                                  {user.role === "customer"
                                    ? booking.providerName
                                    : booking.customerName}
                                </span>
                                <span className="block text-xs text-muted-foreground-1">
                                  {booking.guests} khách
                                </span>
                              </td>
                              <td className="px-4 py-3 align-middle whitespace-nowrap">
                                <span className="block text-sm text-foreground">
                                  {formatDate(booking.serviceDate)}
                                </span>
                                <span className="block text-xs text-muted-foreground-1">
                                  Đặt {formatDate(booking.createdAt)}
                                </span>
                              </td>
                              <td className="px-4 py-3 align-middle text-sm whitespace-nowrap text-foreground">
                                {booking.totalAmount === null
                                  ? "—"
                                  : formatCurrency(booking.totalAmount)}
                              </td>
                              <td className="px-4 py-3 align-middle">
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${status.className}`}
                                >
                                  {status.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            ) : null}
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card title="Hoạt động" icon="chart">
              <p className="text-sm text-muted-foreground-1">
                Tổng{" "}
                <span className="font-semibold text-foreground">
                  {totalBookings}
                </span>{" "}
                lượt đặt dịch vụ
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <div
                    className="rounded-lg border border-card-line px-3 py-2.5"
                    key={stat.label}
                  >
                    <dt className="text-xs text-muted-foreground-1">
                      {stat.label}
                    </dt>
                    <dd className="mt-0.5 text-lg font-semibold text-foreground">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card title="Mốc thời gian" icon="clock">
              <dl className="space-y-3">
                <InfoRow label="Ngày tạo">
                  {formatTime(user.createdAt)}, {formatDate(user.createdAt)}
                </InfoRow>
                <InfoRow label="Cập nhật lần cuối">
                  {formatTime(user.updatedAt)}, {formatDate(user.updatedAt)}
                </InfoRow>
              </dl>
            </Card>
          </div>
        </div>
      </div>

      {isConfirming ? (
        <UserStatusModal
          onClose={() => setIsConfirming(false)}
          onSuccess={(message) => {
            setIsConfirming(false);
            setToast(message);
            router.refresh();
          }}
          user={user}
        />
      ) : null}
    </main>
  );
}
