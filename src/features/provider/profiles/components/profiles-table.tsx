"use client";

import type {
  ApprovalStatus,
  BusinessType,
  ProviderProfile,
} from "@/generated/prisma/client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getServiceMeta, getStatusMeta } from "../../utils";
import {
  formatProfileCode,
  formatSubmittedDate,
  formatUpdatedLabel,
} from "../format";

function ServiceBadge({ type }: { type: BusinessType }) {
  const meta = getServiceMeta(type);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${meta.className}`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
        {meta.icon}
      </span>
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const meta = getStatusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs ${meta.className}`}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: "15px",
          fontVariationSettings: meta.filled ? "'FILL' 1" : undefined,
        }}
      >
        {meta.icon}
      </span>
      {meta.label}
    </span>
  );
}

function IconAction({
  icon,
  title,
  danger,
}: {
  icon: string;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      className={`rounded-lg p-2 text-slate-400 transition ${
        danger
          ? "hover:bg-rose-50 hover:text-rose-600"
          : "hover:bg-slate-100 hover:text-slate-700"
      }`}
      title={title}
      type="button"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
        {icon}
      </span>
    </button>
  );
}

function ProfileRow({ profile }: { profile: ProviderProfile }) {
  const isRejected = profile.approvalStatus === "rejected";
  const cell = isRejected
    ? "px-6 pt-6 pb-5 align-top"
    : "px-6 py-5 align-middle";

  return (
    <tr
      className={`transition-colors hover:bg-slate-50/70 ${
        isRejected ? "bg-rose-50/20" : ""
      }`}
    >
      <td className={`${cell} whitespace-nowrap`}>
        <span className="inline-block rounded-lg border border-slate-200/80 bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">
          {formatProfileCode(profile.id)}
        </span>
      </td>

      <td className={`min-w-[280px] ${cell}`}>
        <div
          className={`flex ${isRejected ? "items-start" : "items-center"} gap-3.5`}
        >
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={profile.businessName}
              className="h-11 w-11 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-slate-200/80"
              src={profile.photoUrl}
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500 ring-1 ring-slate-200/80">
              {profile.businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-bold whitespace-nowrap text-slate-900">
              {profile.businessName}
            </span>
            <div className="mt-1.5">
              <ServiceBadge type={profile.businessType} />
            </div>
          </div>
        </div>
      </td>

      <td className={`${cell} whitespace-nowrap`}>
        <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-800">
          <span>{profile.taxCode ?? "—"}</span>
          {profile.taxCode ? (
            <button
              className="text-slate-400 transition hover:text-slate-700"
              title="Sao chép MST"
            >
              <span className="material-symbols-outlined text-[14px]">
                content_copy
              </span>
            </button>
          ) : null}
        </div>
      </td>

      <td className={`${cell} whitespace-nowrap`}>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-800">
            {formatSubmittedDate(profile.createdAt)}
          </span>
          <span className="mt-0.5 text-xs text-slate-400">
            {formatUpdatedLabel(profile.updatedAt)}
          </span>
        </div>
      </td>

      <td className={cell}>
        <div className="flex flex-col items-start gap-1.5">
          <StatusBadge status={profile.approvalStatus} />
          {isRejected && profile.rejectionReason ? (
            <p className="max-w-[220px] text-xs leading-relaxed text-rose-600">
              {profile.rejectionReason}
            </p>
          ) : null}
        </div>
      </td>

      <td className={`${cell} text-right whitespace-nowrap`}>
        <div className="inline-flex items-center justify-end gap-1.5">
          {isRejected ? (
            <Link
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-600 shadow-2xs transition hover:bg-brand-500 hover:text-white"
              href={`/provider/profiles/${profile.id}/edit`}
              title="Cập nhật và nộp lại hồ sơ"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                replay
              </span>
              <span>Cập nhật &amp; Gửi lại</span>
            </Link>
          ) : (
            <Link
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200/80 hover:text-slate-900"
              href={`/provider/profiles/${profile.id}/edit`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                edit
              </span>
              <span>Sửa</span>
            </Link>
          )}
          <IconAction icon="visibility" title="Xem chi tiết" />
          <IconAction danger icon="delete" title="Xóa hồ sơ" />
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
    <div className="flex flex-col items-center justify-between gap-3 border-b border-slate-200/80 p-4 md:flex-row">
      <div className="relative w-full md:w-96">
        <span className="material-symbols-outlined absolute top-1/2 left-3.5 -translate-y-1/2 text-[20px] text-slate-400">
          search
        </span>
        <input
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm kiếm theo tên đơn vị, MST..."
          type="text"
          value={search}
        />
      </div>
      <div className="flex w-full flex-wrap items-center justify-start gap-2.5 md:w-auto md:justify-end">
        <div className="relative">
          <select
            className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-8 pl-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100/70 focus:border-brand-500 focus:outline-none"
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
          <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[18px] text-slate-400">
            expand_more
          </span>
        </div>
        <div className="relative">
          <select
            className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-8 pl-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100/70 focus:border-brand-500 focus:outline-none"
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
          <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[18px] text-slate-400">
            expand_more
          </span>
        </div>
        <button
          className="flex items-center justify-center self-stretch rounded-xl border border-slate-200 px-2.5 text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-800"
          onClick={onReset}
          title="Đặt lại bộ lọc"
          type="button"
        >
          <span className="material-symbols-outlined block text-[18px]">
            refresh
          </span>
        </button>
      </div>
    </div>
  );
}

function ProfilesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200/80 bg-white p-12 text-center shadow-sm">
      <span className="material-symbols-outlined text-[40px] text-slate-300">
        description
      </span>
      <h3 className="text-base font-bold text-slate-900">
        Bạn chưa có hồ sơ doanh nghiệp nào
      </h3>
      <p className="max-w-sm text-sm text-slate-500">
        Tạo hồ sơ đầu tiên để bắt đầu kinh doanh dịch vụ Tour, Khách sạn hoặc
        Nhà hàng trên Roamly.
      </p>
      <Link
        className="mt-1 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-600"
        href="/provider/profiles/create"
      >
        <span className="material-symbols-outlined text-[20px]">
          add_circle
        </span>
        Thêm hồ sơ mới
      </Link>
    </div>
  );
}

export function ProfilesTable({ profiles }: { profiles: ProviderProfile[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<BusinessType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "all">(
    "all"
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

  const handleReset = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  if (profiles.length === 0) {
    return <ProfilesEmptyState />;
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <ProfilesToolbar
        onReset={handleReset}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        search={search}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
      />
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200/70 bg-slate-50/80 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <th className="px-6 py-4" scope="col">
                Mã hồ sơ
              </th>
              <th
                className="min-w-[280px] px-6 py-4 whitespace-nowrap"
                scope="col"
              >
                Doanh nghiệp &amp; Loại hình
              </th>
              <th className="px-6 py-4" scope="col">
                Mã số thuế (MST)&nbsp;
              </th>
              <th className="px-6 py-4" scope="col">
                Ngày nộp
              </th>
              <th className="px-6 py-4" scope="col">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-right" scope="col">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredProfiles.length === 0 ? (
              <tr>
                <td
                  className="px-6 py-10 text-center text-sm text-slate-500"
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
    </div>
  );
}
