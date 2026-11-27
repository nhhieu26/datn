import type { ProviderProfile } from "@/generated/prisma/client";
import { formatDate, formatDateTime, formatEntityCode } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";
import { getServiceMeta } from "../../utils";
import { DeleteProfileButton } from "./delete-profile-button";
import { ServiceBadge, StatusBadge } from "./profile-badges";
import { ProfileIcon, type ProfileIconName } from "./profile-icon";
import { SignaturePad } from "./signature-pad";

const layerButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden";

const linkClass =
  "text-primary-600 hover:underline focus:underline focus:outline-hidden";

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ProfileIconName;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
      <div className="flex items-center gap-x-2 border-b border-card-divider px-5 py-3">
        <ProfileIcon name={icon} className="size-4 text-muted-foreground-1" />
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

function DocumentRow({
  icon,
  label,
  ok,
  okLabel,
  missingLabel,
  href,
}: {
  icon: ProfileIconName;
  label: string;
  ok: boolean;
  okLabel: string;
  missingLabel: string;
  href?: string | null;
}) {
  return (
    <li className="flex items-center justify-between gap-x-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-x-2.5">
        <ProfileIcon
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
          {ok ? okLabel : missingLabel}
        </span>
        {href ? (
          <a
            aria-label={`Mở ${label}`}
            className={`size-8 ${layerButtonClass}`}
            href={href}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ProfileIcon name="link" className="size-3.5" />
          </a>
        ) : null}
      </div>
    </li>
  );
}

function StatusBanner({ profile }: { profile: ProviderProfile }) {
  const banners = {
    rejected: {
      className: "border-red-200 bg-red-50 text-red-800",
      bodyClassName: "text-red-700",
      icon: "alert",
      title: "Hồ sơ bị từ chối",
      body:
        profile.rejectionReason ??
        "Vui lòng cập nhật thông tin và gửi lại hồ sơ để được thẩm định.",
    },
    pending: {
      className: "border-yellow-200 bg-yellow-50 text-yellow-800",
      bodyClassName: "text-yellow-700",
      icon: "clock",
      title: "Hồ sơ đang chờ thẩm định",
      body: "Roamly sẽ xem xét và phản hồi kết quả thẩm định trong thời gian sớm nhất.",
    },
    not_submitted: {
      className: "border-line-2 bg-surface text-foreground",
      bodyClassName: "text-muted-foreground-1",
      icon: "info",
      title: "Hồ sơ chưa được nộp",
      body: "Hoàn thiện thông tin và gửi hồ sơ để bắt đầu kinh doanh trên Roamly.",
    },
  } satisfies Record<
    Exclude<ProviderProfile["approvalStatus"], "approved">,
    {
      className: string;
      bodyClassName: string;
      icon: ProfileIconName;
      title: string;
      body: string;
    }
  >;

  if (profile.approvalStatus === "approved") return null;
  const banner = banners[profile.approvalStatus];

  return (
    <div
      className={`rounded-lg border p-4 text-sm ${banner.className}`}
      role="alert"
    >
      <div className="flex">
        <ProfileIcon name={banner.icon} className="mt-0.5 size-4" />
        <div className="ms-3">
          <h3 className="font-semibold">{banner.title}</h3>
          <p className={`mt-1 whitespace-pre-line ${banner.bodyClassName}`}>
            {banner.body}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProfileDetail({
  profile,
  serviceCount,
}: {
  profile: ProviderProfile;
  serviceCount: number;
}) {
  const editHref = `/provider/profiles/${profile.id}/edit`;
  const isRejected = profile.approvalStatus === "rejected";

  return (
    <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="grid gap-3 md:flex md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-x-4">
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={profile.businessName}
              className="size-14 shrink-0 rounded-xl object-cover"
              src={profile.photoUrl}
            />
          ) : (
            <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-xl bg-surface text-xl font-semibold text-surface-foreground">
              {profile.businessName.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-foreground">
              {profile.businessName}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-md bg-surface px-2 py-0.5 font-mono text-xs font-medium text-surface-foreground">
                {formatEntityCode("PR", profile.id)}
              </span>
              <ServiceBadge type={profile.businessType} />
              <StatusBadge status={profile.approvalStatus} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 self-start md:self-auto">
          <Link
            className={`px-3 py-2 ${layerButtonClass}`}
            href={`/provider/profiles?type=${profile.businessType}`}
          >
            <ProfileIcon name="arrowLeft" />
            Quay lại danh sách
          </Link>
          <DeleteProfileButton
            profile={{ id: profile.id, businessName: profile.businessName }}
          />
          <Link className={primaryButtonClass} href={editHref}>
            <ProfileIcon name={isRejected ? "resubmit" : "edit"} />
            {isRejected ? "Cập nhật & Gửi lại" : "Sửa hồ sơ"}
          </Link>
        </div>
      </div>

      <StatusBanner profile={profile} />

      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          <Card title="Thông tin doanh nghiệp" icon="file">
            <dl className="space-y-3">
              <InfoRow label="Tên doanh nghiệp">{profile.businessName}</InfoRow>
              <InfoRow label="Loại hình">
                {getServiceMeta(profile.businessType).label}
              </InfoRow>
              <InfoRow label="Mã số thuế">
                <span className="font-mono">{profile.taxCode ?? "—"}</span>
              </InfoRow>
              <InfoRow label="Địa chỉ">
                {profile.address ?? "Chưa cập nhật địa chỉ"}
              </InfoRow>
              <InfoRow label="Website">
                {profile.website ? (
                  <a
                    className={linkClass}
                    href={profile.website}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {profile.website}
                  </a>
                ) : (
                  "—"
                )}
              </InfoRow>
              <InfoRow label="Dịch vụ đã đăng">{serviceCount} dịch vụ</InfoRow>
            </dl>
            <div className="mt-5 border-t border-card-divider pt-5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground-1 uppercase">
                Mô tả doanh nghiệp
              </p>
              <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground-2">
                {profile.description ?? "Chưa có mô tả."}
              </p>
            </div>
          </Card>

          <Card title="Giấy tờ pháp lý" icon="shieldCheck">
            <ul className="divide-y divide-card-divider rounded-lg border border-card-line">
              <DocumentRow
                icon="receipt"
                label="Mã số thuế"
                ok={Boolean(profile.taxCode)}
                okLabel="Đã cung cấp"
                missingLabel="Còn thiếu"
              />
              <DocumentRow
                icon="file"
                label="Hồ sơ pháp lý / năng lực"
                ok={Boolean(profile.licenseUrl)}
                okLabel="Có liên kết"
                missingLabel="Cần bổ sung"
                href={profile.licenseUrl}
              />
              <DocumentRow
                icon="globe"
                label="Website chính thức"
                ok={Boolean(profile.website)}
                okLabel="Đã khai báo"
                missingLabel="Không có"
                href={profile.website}
              />
            </ul>
          </Card>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card title="Tài khoản nhận thanh toán" icon="wallet">
            <dl className="space-y-3">
              <InfoRow label="PayPal">{profile.payoutEmail}</InfoRow>
              <InfoRow label="Ngày liên kết">
                {formatDate(profile.paypalLinkedAt)}
              </InfoRow>
            </dl>
          </Card>

          <Card title="Chữ ký trên hóa đơn" icon="edit">
            <SignaturePad profileId={profile.id} signatureUrl={profile.signatureUrl} />
          </Card>

          <Card title="Mốc thời gian" icon="clock">
            <dl className="space-y-3">
              <InfoRow label="Ngày tạo">
                {formatDateTime(profile.createdAt)}
              </InfoRow>
              <InfoRow label="Cập nhật lần cuối">
                {formatDateTime(profile.updatedAt)}
              </InfoRow>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
