"use client";

import { formatDate, formatEntityCode, formatTime } from "@/lib/utils";
import type { UserStatus } from "@/generated/prisma/client";
import type { ActionState } from "@/shared/lib/action-state";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import {
  approveProviderProfilesAction,
  rejectProviderProfileAction,
} from "../actions";
import type { ApprovalMutationResult, ApprovalProfileDetail } from "../types";
import { ApprovalIcon, type ApprovalIconName } from "./approval-icon";
import { ApprovalRejectModal } from "./approval-reject-modal";
import {
  ApprovalToast,
  BusinessBadge,
  businessMeta,
  getActionError,
  layerButtonClass,
  primaryButtonClass,
  StatusBadge,
} from "./approval-shared";

const userStatusMeta: Record<UserStatus, { label: string; className: string }> =
  {
    active: { label: "Đang hoạt động", className: "bg-teal-100 text-teal-800" },
    inactive: {
      label: "Chưa kích hoạt",
      className: "bg-surface text-surface-foreground",
    },
    banned: { label: "Đã bị cấm", className: "bg-red-100 text-red-800" },
  };

function Card({
  title,
  icon,
  className = "",
  children,
}: {
  title: string;
  icon: ApprovalIconName;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`flex flex-col rounded-xl border border-card-line bg-card shadow-2xs ${className}`}
    >
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
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-x-4">
      <dt className="text-sm text-muted-foreground-1">{label}</dt>
      <dd className="min-w-0 text-sm font-medium break-words text-foreground">
        {children}
      </dd>
    </div>
  );
}

function VerificationRow({
  icon,
  label,
  value,
  ok,
  href,
}: {
  icon: ApprovalIconName;
  label: string;
  value: string;
  ok: boolean;
  href?: string | null;
}) {
  return (
    <li className="flex items-center justify-between gap-x-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-x-2.5">
        <ApprovalIcon
          name={icon}
          className={`size-4 ${ok ? "text-teal-600" : "text-yellow-600"}`}
        />
        <span className="truncate text-sm text-foreground">{label}</span>
      </div>
      <div className="flex shrink-0 items-center gap-x-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            ok ? "bg-teal-100 text-teal-800" : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {value}
        </span>
        {href ? (
          <Link
            aria-label={`Mở ${label}`}
            className={`size-8 ${layerButtonClass}`}
            href={href}
            rel="noreferrer"
            target="_blank"
          >
            <ApprovalIcon name="externalLink" className="size-3.5" />
          </Link>
        ) : null}
      </div>
    </li>
  );
}

export function ProfileApprovalDetail({
  profile: initialProfile,
}: {
  profile: ApprovalProfileDetail;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [isRejecting, setIsRejecting] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const canReview = profile.approvalStatus === "pending";

  const runMutation = (
    mutation: () => Promise<ActionState<ApprovalMutationResult>>,
    successMessage: string,
    onSuccess?: () => void,
  ) => {
    setMessage("");
    startTransition(async () => {
      const result = await mutation();
      if (result.status === "error" || !result.data) {
        setMessage(getActionError(result));
        return;
      }

      const patch = result.data.profiles.find(({ id }) => id === profile.id);
      if (patch) setProfile((current) => ({ ...current, ...patch }));
      setMessage(
        result.data.updatedCount > 0
          ? successMessage
          : "Hồ sơ không còn ở trạng thái chờ duyệt.",
      );
      onSuccess?.();
      router.refresh();
    });
  };

  const handleApprove = () => {
    runMutation(
      () => approveProviderProfilesAction([profile.id]),
      "Đã duyệt hồ sơ.",
    );
  };

  const handleReject = (reason: string) => {
    if (!reason.trim()) {
      setMessage("Vui lòng nhập lý do trước khi từ chối hồ sơ.");
      return;
    }
    runMutation(
      () => rejectProviderProfileAction(profile.id, reason),
      "Đã từ chối hồ sơ và lưu lý do phản hồi.",
      () => setIsRejecting(false),
    );
  };

  const userStatus = userStatusMeta[profile.user.status];

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        {message ? (
          <ApprovalToast message={message} onClose={() => setMessage("")} />
        ) : null}

        <div className="grid gap-3 md:flex md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-foreground">
              {profile.businessName}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-md bg-surface px-2 py-0.5 font-mono text-xs font-medium text-surface-foreground">
                {formatEntityCode("PR", profile.id)}
              </span>
              <BusinessBadge type={profile.businessType} />
              <StatusBadge status={profile.approvalStatus} />
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 self-start md:self-auto">
            <Link
              className={`px-3 py-2 ${layerButtonClass}`}
              href="/admin/profile-approval"
            >
              <ApprovalIcon name="arrowLeft" />
              Quay lại danh sách
            </Link>
            {canReview ? (
              <>
                <button
                  className="inline-flex items-center justify-center gap-x-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 focus:bg-red-100 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
                  disabled={isPending}
                  onClick={() => setIsRejecting(true)}
                  type="button"
                >
                  <ApprovalIcon name="x" />
                  Từ chối
                </button>
                <button
                  className={primaryButtonClass}
                  disabled={isPending}
                  onClick={handleApprove}
                  type="button"
                >
                  <ApprovalIcon name="check" />
                  Duyệt hồ sơ
                </button>
              </>
            ) : null}
          </div>
        </div>

        {profile.approvalStatus === "rejected" && profile.rejectionReason ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            <div className="flex">
              <ApprovalIcon name="alert" className="mt-0.5 size-4" />
              <div className="ms-3">
                <h3 className="font-semibold">Lý do từ chối</h3>
                <p className="mt-1 whitespace-pre-line text-red-700">
                  {profile.rejectionReason}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            <Card title="Thông tin doanh nghiệp" icon="file">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={profile.businessName}
                  className="mb-5 aspect-[16/7] w-full rounded-lg object-cover"
                  src={profile.photoUrl}
                />
              ) : null}
              <dl className="space-y-3">
                <InfoRow label="Tên doanh nghiệp">
                  {profile.businessName}
                </InfoRow>
                <InfoRow label="Loại hình">
                  {businessMeta[profile.businessType].label}
                </InfoRow>
                <InfoRow label="Mã số thuế">
                  <span className="font-mono">{profile.taxCode ?? "—"}</span>
                </InfoRow>
                <InfoRow label="Địa chỉ">
                  {profile.address ?? "Chưa cập nhật địa chỉ"}
                </InfoRow>
                <InfoRow label="Website">
                  {profile.website ? (
                    <Link
                      className="text-primary-600 hover:underline focus:underline focus:outline-hidden"
                      href={profile.website}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {profile.website}
                    </Link>
                  ) : (
                    "—"
                  )}
                </InfoRow>
                <InfoRow label="Dịch vụ đã đăng">
                  {profile.serviceCount} dịch vụ
                </InfoRow>
              </dl>
              <div className="mt-5 border-t border-card-divider pt-5">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground-1 uppercase">
                  Mô tả doanh nghiệp
                </p>
                <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground-2">
                  {profile.description ?? "Đối tác chưa cập nhật mô tả."}
                </p>
              </div>
            </Card>

            <Card title="Đối chiếu pháp lý" icon="shieldCheck">
              <ul className="divide-y divide-card-divider rounded-lg border border-card-line">
                <VerificationRow
                  icon="receipt"
                  label="Mã số thuế"
                  value={profile.taxCode ? "Đã cung cấp" : "Còn thiếu"}
                  ok={Boolean(profile.taxCode)}
                />
                <VerificationRow
                  icon="file"
                  label="Hồ sơ pháp lý / năng lực"
                  value={profile.licenseUrl ? "Có liên kết" : "Cần bổ sung"}
                  ok={Boolean(profile.licenseUrl)}
                  href={profile.licenseUrl}
                />
                <VerificationRow
                  icon="globe"
                  label="Website chính thức"
                  value={profile.website ? "Đã khai báo" : "Không có"}
                  ok={Boolean(profile.website)}
                  href={profile.website}
                />
              </ul>
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card title="Người đại diện" icon="user">
              <div className="flex items-center gap-x-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {profile.user.fullname.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {profile.user.fullname}
                  </p>
                  <span
                    className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${userStatus.className}`}
                  >
                    {userStatus.label}
                  </span>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-center gap-x-2.5">
                  <ApprovalIcon
                    name="mail"
                    className="size-4 text-muted-foreground-1"
                  />
                  <a
                    className="truncate text-primary-600 hover:underline focus:underline focus:outline-hidden"
                    href={`mailto:${profile.user.email}`}
                  >
                    {profile.user.email}
                  </a>
                </li>
                <li className="flex items-center gap-x-2.5 text-foreground">
                  <ApprovalIcon
                    name="phone"
                    className="size-4 text-muted-foreground-1"
                  />
                  {profile.user.phone}
                </li>
                <li className="flex items-center gap-x-2.5 text-foreground">
                  <ApprovalIcon
                    name="calendar"
                    className="size-4 text-muted-foreground-1"
                  />
                  Tham gia {formatDate(profile.user.createdAt)}
                </li>
              </ul>
            </Card>

            <Card title="Thanh toán" icon="wallet">
              <dl className="space-y-3">
                <InfoRow label="PayPal">{profile.payoutEmail}</InfoRow>
                <InfoRow label="Ngày liên kết">
                  {formatDate(profile.paypalLinkedAt)}
                </InfoRow>
              </dl>
            </Card>

            <Card title="Mốc thời gian" icon="clock">
              <dl className="space-y-3">
                <InfoRow label="Ngày nộp">
                  {formatTime(profile.createdAt)},{" "}
                  {formatDate(profile.createdAt)}
                </InfoRow>
                <InfoRow label="Cập nhật lần cuối">
                  {formatTime(profile.updatedAt)},{" "}
                  {formatDate(profile.updatedAt)}
                </InfoRow>
              </dl>
            </Card>
          </div>
        </div>
      </div>

      {isRejecting ? (
        <ApprovalRejectModal
          isPending={isPending}
          onClose={() => setIsRejecting(false)}
          onConfirm={handleReject}
          profile={profile}
        />
      ) : null}
    </main>
  );
}
