"use client";

import type {
  ApprovalStatus,
  BusinessType,
  ProviderProfile,
} from "@/generated/prisma/client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getServiceMeta, getStatusMeta } from "../../utils";
import { formatDate, formatEntityCode, formatUpdatedLabel } from "@/lib/utils";
import { ProfileIcon, type ProfileIconName } from "./profile-icon";

type HSWindow = Window & {
  HSDropdown?: { autoInit: () => void };
};

const serviceIcons: Record<BusinessType, ProfileIconName> = {
  tour: "map",
  hotel: "bed",
  restaurant: "utensils",
};

const statusStyles: Record<
  ApprovalStatus,
  { icon: ProfileIconName; className: string }
> = {
  approved: { icon: "check", className: "bg-teal-100 text-teal-800" },
  pending: { icon: "clock", className: "bg-yellow-100 text-yellow-800" },
  rejected: { icon: "x", className: "bg-red-100 text-red-800" },
  not_submitted: {
    icon: "draft",
    className: "bg-surface text-surface-foreground",
  },
};

const inputClass =
  "block rounded-lg border-layer-line bg-layer py-2 text-foreground placeholder:text-muted-foreground-1 focus:border-primary-focus focus:ring-primary-focus sm:text-sm";

const layerButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

const primaryButtonClass =
  "inline-flex items-center gap-x-2 rounded-lg border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

const dropdownItemClass =
  "flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:bg-dropdown-item-focus focus:outline-hidden";

function ServiceBadge({ type }: { type: BusinessType }) {
  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-md border border-line-2 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-foreground">
      <ProfileIcon
        name={serviceIcons[type]}
        className="size-3 text-muted-foreground-1"
      />
      {getServiceMeta(type).label}
    </span>
  );
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const style = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${style.className}`}
    >
      <ProfileIcon name={style.icon} className="size-3" />
      {getStatusMeta(status).label}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted-hover hover:text-foreground focus:bg-muted-focus focus:outline-hidden"
      onClick={handleCopy}
      title={copied ? "Đã sao chép" : "Sao chép MST"}
      type="button"
    >
      <ProfileIcon
        name={copied ? "tick" : "copy"}
        className={`size-3.5 ${copied ? "text-teal-600" : ""}`}
      />
    </button>
  );
}

function RowActions({ profile }: { profile: ProviderProfile }) {
  const dropdownId = `hs-profile-actions-${profile.id}`;
  const editHref = `/provider/profiles/${profile.id}/edit`;

  return (
    <div className="hs-dropdown relative inline-flex [--placement:bottom-right]">
      <button
        id={dropdownId}
        type="button"
        className={`hs-dropdown-toggle size-8 ${layerButtonClass}`}
        aria-haspopup="menu"
        aria-expanded="false"
        aria-label="Thao tác"
      >
        <ProfileIcon name="more" />
      </button>

      <div
        className="hs-dropdown-menu duration z-20 hidden min-w-44 rounded-xl border border-dropdown-line bg-dropdown opacity-0 shadow-xl transition-[opacity,margin] hs-dropdown-open:opacity-100"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby={dropdownId}
      >
        <div className="space-y-0.5 p-1">
          <Link className={dropdownItemClass} href={editHref}>
            <ProfileIcon name="edit" />
            Sửa hồ sơ
          </Link>
          <button className={dropdownItemClass} type="button">
            <ProfileIcon name="eye" />
            Xem chi tiết
          </button>
        </div>
        <div className="space-y-0.5 border-t border-dropdown-divider p-1">
          <button
            className="flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-hidden"
            type="button"
          >
            <ProfileIcon name="trash" />
            Xóa hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ profile }: { profile: ProviderProfile }) {
  const isRejected = profile.approvalStatus === "rejected";
  const cell = `px-6 py-4 ${isRejected ? "align-top" : "align-middle"}`;

  return (
    <tr className={isRejected ? "bg-red-50/40" : "hover:bg-layer-hover"}>
      <td className={`${cell} whitespace-nowrap`}>
        <span className="inline-flex rounded-md bg-surface px-2 py-0.5 font-mono text-xs font-medium text-surface-foreground">
          {formatEntityCode("PR", profile.id)}
        </span>
      </td>

      <td className={`min-w-70 ${cell}`}>
        <div className="flex items-center gap-x-3">
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={profile.businessName}
              className="size-9.5 shrink-0 rounded-lg object-cover"
              src={profile.photoUrl}
            />
          ) : (
            <span className="inline-flex size-9.5 shrink-0 items-center justify-center rounded-lg bg-surface text-sm font-semibold text-surface-foreground">
              {profile.businessName.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="grow">
            <span className="block text-sm font-semibold whitespace-nowrap text-foreground">
              {profile.businessName}
            </span>
            <div className="mt-1">
              <ServiceBadge type={profile.businessType} />
            </div>
          </div>
        </div>
      </td>

      <td className={`${cell} whitespace-nowrap`}>
        <div className="flex items-center gap-x-1">
          <span className="font-mono text-sm text-foreground">
            {profile.taxCode ?? "—"}
          </span>
          {profile.taxCode ? <CopyButton value={profile.taxCode} /> : null}
        </div>
      </td>

      <td className={`${cell} whitespace-nowrap`}>
        <span className="block text-sm text-foreground">
          {formatDate(profile.createdAt)}
        </span>
        <span className="block text-xs text-muted-foreground-1">
          {formatUpdatedLabel(profile.updatedAt)}
        </span>
      </td>

      <td className={cell}>
        <StatusBadge status={profile.approvalStatus} />
        {isRejected && profile.rejectionReason ? (
          <p className="mt-2 max-w-60 text-xs text-red-600">
            {profile.rejectionReason}
          </p>
        ) : null}
      </td>

      <td className={`${cell} text-end whitespace-nowrap`}>
        <div className="inline-flex items-center gap-x-2">
          {isRejected ? (
            <Link
              className="inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-primary-100 px-3 py-2 text-sm font-medium text-primary-800 hover:bg-primary-200 focus:bg-primary-200 focus:outline-hidden"
              href={`/provider/profiles/${profile.id}/edit`}
              title="Cập nhật và nộp lại hồ sơ"
            >
              <ProfileIcon name="resubmit" />
              Cập nhật &amp; Gửi lại
            </Link>
          ) : null}
          <RowActions profile={profile} />
        </div>
      </td>
    </tr>
  );
}

type ToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: BusinessType | "all";
  onTypeChange: (value: BusinessType | "all") => void;
  statusFilter: ApprovalStatus | "all";
  onStatusChange: (value: ApprovalStatus | "all") => void;
  onReset: () => void;
};

function ProfilesToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  onReset,
}: ToolbarProps) {
  return (
    <div className="grid gap-3 border-b border-card-line px-6 py-4 md:flex md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm">
        <div className="pointer-events-none absolute inset-y-0 start-0 z-20 flex items-center ps-3.5">
          <ProfileIcon name="search" className="size-4 text-muted-foreground" />
        </div>
        <label className="sr-only" htmlFor="hs-profiles-search">
          Tìm kiếm hồ sơ
        </label>
        <input
          className={`${inputClass} w-full ps-10 pe-4`}
          id="hs-profiles-search"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm kiếm theo tên đơn vị, MST..."
          type="text"
          value={search}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Lọc theo dịch vụ"
          className={`${inputClass} ps-3 pe-9`}
          onChange={(event) =>
            onTypeChange(event.target.value as BusinessType | "all")
          }
          value={typeFilter}
        >
          <option value="all">Tất cả dịch vụ</option>
          <option value="tour">Tour du lịch</option>
          <option value="hotel">Khách sạn &amp; Lưu trú</option>
          <option value="restaurant">Nhà hàng &amp; Ẩm thực</option>
        </select>
        <select
          aria-label="Lọc theo trạng thái"
          className={`${inputClass} ps-3 pe-9`}
          onChange={(event) =>
            onStatusChange(event.target.value as ApprovalStatus | "all")
          }
          value={statusFilter}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="approved">Đã duyệt</option>
          <option value="pending">Chờ thẩm định</option>
          <option value="rejected">Bị từ chối</option>
          <option value="not_submitted">Chưa nộp</option>
        </select>
        <button
          className={`px-3 py-2 ${layerButtonClass}`}
          onClick={onReset}
          type="button"
        >
          <ProfileIcon name="reset" />
          Đặt lại
        </button>
      </div>
    </div>
  );
}

function ProfilesEmptyState() {
  return (
    <div className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
      <div className="flex min-h-80 flex-col items-center justify-center p-4 text-center md:p-5">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground-2">
          <ProfileIcon name="file" className="size-6" />
        </span>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Bạn chưa có hồ sơ doanh nghiệp nào
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground-1">
          Tạo hồ sơ đầu tiên để bắt đầu kinh doanh dịch vụ Tour, Khách sạn hoặc
          Nhà hàng trên Roamly.
        </p>
        <Link
          className={`mt-5 ${primaryButtonClass}`}
          href="/provider/profiles/create"
        >
          <ProfileIcon name="plus" />
          Thêm hồ sơ mới
        </Link>
      </div>
    </div>
  );
}

export function ProfilesTable({ profiles }: { profiles: ProviderProfile[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<BusinessType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "all">(
    "all",
  );

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return profiles.filter((profile) => {
      const matchesSearch =
        query.length === 0 ||
        profile.businessName.toLowerCase().includes(query) ||
        (profile.taxCode ?? "").toLowerCase().includes(query);
      const matchesType =
        typeFilter === "all" || profile.businessType === typeFilter;
      const matchesStatus =
        statusFilter === "all" || profile.approvalStatus === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [profiles, search, typeFilter, statusFilter]);

  // Dòng mới hiện ra sau khi lọc cần được Preline khởi tạo dropdown
  useEffect(() => {
    (window as HSWindow).HSDropdown?.autoInit();
  }, [filteredProfiles]);

  const handleReset = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  if (profiles.length === 0) {
    return <ProfilesEmptyState />;
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-card-line bg-card shadow-2xs">
      <ProfilesToolbar
        onReset={handleReset}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        search={search}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-table-line">
          <thead className="bg-muted">
            <tr>
              {[
                "Mã hồ sơ",
                "Doanh nghiệp & Loại hình",
                "Mã số thuế (MST)",
                "Ngày nộp",
                "Trạng thái",
              ].map((label) => (
                <th
                  key={label}
                  className="px-6 py-3 text-start whitespace-nowrap"
                  scope="col"
                >
                  <span className="text-xs font-semibold text-foreground uppercase">
                    {label}
                  </span>
                </th>
              ))}
              <th className="px-6 py-3 text-end" scope="col">
                <span className="text-xs font-semibold text-foreground uppercase">
                  Thao tác
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-table-line">
            {filteredProfiles.length === 0 ? (
              <tr>
                <td
                  className="px-6 py-10 text-center text-sm text-muted-foreground-1"
                  colSpan={6}
                >
                  Không tìm thấy hồ sơ phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredProfiles.map((profile) => (
                <ProfileRow key={profile.id} profile={profile} />
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-card-line px-6 py-4">
        <p className="text-sm text-muted-foreground-1">
          Hiển thị{" "}
          <span className="font-semibold text-foreground">
            {filteredProfiles.length}
          </span>{" "}
          / {profiles.length} hồ sơ
        </p>
      </div>
    </div>
  );
}
