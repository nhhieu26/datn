"use client";

import { formatDate, formatEntityCode, formatTime } from "@/lib/utils";
import Link from "next/link";
import { useEffect } from "react";
import type { ApprovalProfile } from "../types";
import { ApprovalFilterBar } from "./approval-filter-bar";
import { ApprovalIcon } from "./approval-icon";
import {
  BusinessBadge,
  checkboxClass,
  layerButtonClass,
  ProfileAvatar,
  StatusBadge,
  type ApprovalCounts,
  type StatusFilter,
  type TypeFilter,
} from "./approval-shared";

type HSWindow = Window & {
  HSDropdown?: { autoInit: () => void };
};

const dropdownItemClass =
  "flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:bg-dropdown-item-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

function RowActions({
  profile,
  isPending,
  onApprove,
  onReject,
}: {
  profile: ApprovalProfile;
  isPending: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const dropdownId = `hs-approval-actions-${profile.id}`;
  const isReviewable = profile.approvalStatus === "pending";

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
        <ApprovalIcon name="more" />
      </button>

      <div
        className="hs-dropdown-menu duration z-20 hidden min-w-48 rounded-xl border border-dropdown-line bg-dropdown opacity-0 shadow-xl transition-[opacity,margin] hs-dropdown-open:opacity-100"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby={dropdownId}
      >
        <div className="space-y-0.5 p-1">
          <Link
            className={dropdownItemClass}
            href={`/admin/profile-approval/${profile.id}`}
          >
            <ApprovalIcon name="eye" />
            Xem chi tiết
          </Link>
          {profile.licenseUrl ? (
            <Link
              className={dropdownItemClass}
              href={profile.licenseUrl}
              rel="noreferrer"
              target="_blank"
            >
              <ApprovalIcon name="file" />
              Mở hồ sơ pháp lý
            </Link>
          ) : null}
          {profile.website ? (
            <Link
              className={dropdownItemClass}
              href={profile.website}
              rel="noreferrer"
              target="_blank"
            >
              <ApprovalIcon name="externalLink" />
              Website
            </Link>
          ) : null}
        </div>
        {isReviewable ? (
          <div className="space-y-0.5 border-t border-dropdown-divider p-1">
            <button
              className="flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-teal-700 hover:bg-teal-50 focus:bg-teal-50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
              disabled={isPending}
              onClick={onApprove}
              type="button"
            >
              <ApprovalIcon name="check" />
              Duyệt hồ sơ
            </button>
            <button
              className="flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
              disabled={isPending}
              onClick={onReject}
              type="button"
            >
              <ApprovalIcon name="x" />
              Từ chối
            </button>
          </div>
        ) : null}
        <div className="space-y-0.5 border-t border-dropdown-divider p-1">
          <button
            className="flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-hidden"
            type="button"
          >
            <ApprovalIcon name="ban" />
            Cấm provider
          </button>
        </div>
      </div>
    </div>
  );
}

const pageButtonClass =
  "inline-flex min-h-9.5 min-w-9.5 items-center justify-center gap-x-2 rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-muted-hover focus:bg-muted-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

export function ApprovalProfilesTable({
  profiles,
  total,
  checkedIds,
  isPending,
  isRefreshing,
  allPendingChecked,
  onToggleAllPending,
  onToggleChecked,
  onApprove,
  onReject,
  counts,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  onResetFilters,
}: {
  profiles: ApprovalProfile[];
  total: number;
  checkedIds: Set<string>;
  isPending: boolean;
  isRefreshing: boolean;
  allPendingChecked: boolean;
  onToggleAllPending: () => void;
  onToggleChecked: (id: string) => void;
  onApprove: (profile: ApprovalProfile) => void;
  onReject: (profile: ApprovalProfile) => void;
  counts: ApprovalCounts;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  onResetFilters: () => void;
}) {
  // Dòng mới hiện ra sau khi lọc cần được Preline khởi tạo dropdown
  useEffect(() => {
    (window as HSWindow).HSDropdown?.autoInit();
  }, [profiles]);

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-card-line bg-card shadow-2xs">
      <ApprovalFilterBar
        isPending={isPending}
        isRefreshing={isRefreshing}
        counts={counts}
        search={search}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        typeFilter={typeFilter}
        onTypeFilterChange={onTypeFilterChange}
        onReset={onResetFilters}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-table-line">
          <thead className="bg-muted">
            <tr>
              <th className="py-3 ps-6 pe-2 text-start" scope="col">
                <label className="flex">
                  <input
                    checked={allPendingChecked}
                    className={checkboxClass}
                    onChange={onToggleAllPending}
                    type="checkbox"
                  />
                  <span className="sr-only">Chọn tất cả hồ sơ chờ duyệt</span>
                </label>
              </th>
              {[
                "Doanh nghiệp",
                "Mã số thuế & pháp lý",
                "Người đại diện",
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
            {profiles.length === 0 ? (
              <tr>
                <td className="px-6 py-14" colSpan={7}>
                  <div className="flex flex-col items-center text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground-2">
                      <ApprovalIcon name="search" className="size-6" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-foreground">
                      Không tìm thấy hồ sơ phù hợp
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground-1">
                      Thử thay đổi từ khóa hoặc bộ lọc đang chọn.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              profiles.map((profile) => {
                const checked = checkedIds.has(profile.id);
                return (
                  <tr
                    className={
                      checked ? "bg-primary-50" : "hover:bg-layer-hover"
                    }
                    key={profile.id}
                  >
                    <td className="py-4 ps-6 pe-2 align-middle">
                      <label className="flex">
                        <input
                          checked={checked}
                          className={checkboxClass}
                          disabled={profile.approvalStatus !== "pending"}
                          onChange={() => onToggleChecked(profile.id)}
                          type="checkbox"
                        />
                        <span className="sr-only">
                          Chọn {profile.businessName}
                        </span>
                      </label>
                    </td>
                    <td className="min-w-70 px-6 py-4 align-middle">
                      <div className="flex items-center gap-x-3">
                        <ProfileAvatar profile={profile} />
                        <div className="min-w-0 grow">
                          <Link
                            className="block max-w-60 truncate text-sm font-semibold text-foreground hover:text-primary-600 focus:text-primary-600 focus:outline-hidden"
                            href={`/admin/profile-approval/${profile.id}`}
                          >
                            {profile.businessName}
                          </Link>
                          <div className="mt-1 flex items-center gap-x-1.5">
                            <span className="inline-flex rounded-md bg-surface px-1.5 py-0.5 font-mono text-xs font-medium text-surface-foreground">
                              {formatEntityCode("PR", profile.id)}
                            </span>
                            <BusinessBadge type={profile.businessType} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                      <span className="block font-mono text-sm text-foreground">
                        {profile.taxCode ?? "—"}
                      </span>
                      <span
                        className={`mt-1 inline-flex items-center gap-x-1 text-xs ${
                          profile.licenseUrl ? "text-teal-600" : "text-red-600"
                        }`}
                      >
                        <ApprovalIcon
                          name={profile.licenseUrl ? "file" : "alert"}
                          className="size-3"
                        />
                        {profile.licenseUrl
                          ? "Đã đính kèm hồ sơ"
                          : "Thiếu hồ sơ pháp lý"}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                      <span className="block text-sm text-foreground">
                        {profile.user.fullname}
                      </span>
                      <span className="block max-w-48 truncate text-xs text-muted-foreground-1">
                        {profile.user.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                      <span className="block text-sm text-foreground">
                        {formatDate(profile.createdAt)}
                      </span>
                      <span className="block text-xs text-muted-foreground-1">
                        {formatTime(profile.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <StatusBadge status={profile.approvalStatus} />
                    </td>
                    <td className="px-6 py-4 text-end align-middle whitespace-nowrap">
                      <RowActions
                        isPending={isPending}
                        onApprove={() => onApprove(profile)}
                        onReject={() => onReject(profile)}
                        profile={profile}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 border-t border-card-line px-6 py-4 md:flex md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground-1">
          Hiển thị{" "}
          <span className="font-semibold text-foreground">
            {profiles.length}
          </span>{" "}
          / {total} hồ sơ
        </p>
        <nav aria-label="Phân trang" className="flex items-center gap-x-1">
          <button
            aria-label="Trang trước"
            className={pageButtonClass}
            disabled
            type="button"
          >
            <ApprovalIcon name="chevronLeft" className="size-3.5" />
          </button>
          <span
            aria-current="page"
            className="flex min-h-9.5 min-w-9.5 items-center justify-center rounded-lg bg-muted px-3 py-2 text-sm text-foreground"
          >
            1
          </span>
          <button
            aria-label="Trang sau"
            className={pageButtonClass}
            disabled
            type="button"
          >
            <ApprovalIcon name="chevronRight" className="size-3.5" />
          </button>
        </nav>
      </div>
    </section>
  );
}
