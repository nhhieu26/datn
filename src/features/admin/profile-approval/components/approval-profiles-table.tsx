import { formatDate, formatEntityCode, formatTime } from "@/lib/utils";
import type { ApprovalProfile } from "../types";
import { ApprovalFilterBar } from "./approval-filter-bar";
import { BusinessBadge, ProfileAvatar, StatusBadge } from "./approval-shared";
import type {
  ApprovalCounts,
  StatusFilter,
  TypeFilter,
} from "./approval-shared";

export function ApprovalProfilesTable({
  profiles,
  total,
  selectedId,
  checkedIds,
  allPendingChecked,
  onToggleAllPending,
  onToggleChecked,
  onSelectProfile,
  onViewProfile,
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
  selectedId: string;
  checkedIds: Set<string>;
  allPendingChecked: boolean;
  onToggleAllPending: () => void;
  onToggleChecked: (id: string) => void;
  onSelectProfile: (profile: ApprovalProfile) => void;
  onViewProfile: (id: string) => void;
  counts: ApprovalCounts;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  onResetFilters: () => void;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <ApprovalFilterBar
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
        <table className="w-full min-w-[980px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            <tr>
              <th className="w-12 px-4 py-3.5 text-center">
                <input
                  checked={allPendingChecked}
                  className="h-4 w-4 accent-brand-500"
                  onChange={onToggleAllPending}
                  type="checkbox"
                  aria-label="Chọn tất cả hồ sơ chờ duyệt"
                />
              </th>
              <th className="px-4 py-3.5">Doanh nghiệp</th>
              <th className="px-4 py-3.5">Mã số thuế &amp; pháp lý</th>
              <th className="px-4 py-3.5">Người đại diện</th>
              <th className="px-4 py-3.5">Ngày nộp</th>
              <th className="px-4 py-3.5">Trạng thái</th>
              <th className="px-4 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {profiles.map((profile) => {
              const active = selectedId === profile.id;
              return (
                <tr
                  className={`cursor-pointer transition ${
                    active ? "bg-brand-50/70" : "hover:bg-slate-50/80"
                  }`}
                  key={profile.id}
                  onClick={() => onSelectProfile(profile)}
                >
                  <td className="px-4 py-4 text-center">
                    <input
                      checked={checkedIds.has(profile.id)}
                      className="h-4 w-4 accent-brand-500 disabled:opacity-30"
                      disabled={profile.approvalStatus !== "pending"}
                      onChange={() => onToggleChecked(profile.id)}
                      onClick={(event) => event.stopPropagation()}
                      type="checkbox"
                      aria-label={`Chọn ${profile.businessName}`}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar profile={profile} />
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-sky-700">
                            {formatEntityCode("PR", profile.id)}
                          </span>
                          <BusinessBadge type={profile.businessType} />
                        </div>
                        <p className="max-w-56 truncate text-xs font-bold text-slate-900">
                          {profile.businessName}
                        </p>
                        <p className="mt-0.5 max-w-56 truncate text-[10px] text-slate-400">
                          {profile.address}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-mono text-xs font-bold text-slate-800">
                      {profile.taxCode ?? "Chưa cung cấp"}
                    </p>
                    <p
                      className={`mt-1 flex items-center gap-1 text-[10px] font-semibold ${
                        profile.licenseUrl ? "text-sky-700" : "text-rose-600"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {profile.licenseUrl ? "description" : "warning"}
                      </span>
                      {profile.licenseUrl
                        ? "Đã đính kèm hồ sơ"
                        : "Thiếu hồ sơ pháp lý"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs font-semibold text-slate-800">
                      {profile.user.fullname}
                    </p>
                    <p className="mt-0.5 max-w-40 truncate text-[10px] text-slate-400">
                      {profile.user.email}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs font-semibold text-slate-700">
                      {formatDate(profile.createdAt)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {formatTime(profile.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={profile.approvalStatus} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        onClick={(event) => {
                          event.stopPropagation();
                          onViewProfile(profile.id);
                        }}
                        type="button"
                        title="Xem chi tiết"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "18px" }}
                        >
                          visibility
                        </span>
                      </button>
                      <button
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        type="button"
                        title="Cấm provider"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "18px" }}
                        >
                          block
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {profiles.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <span className="material-symbols-outlined text-[40px] text-slate-300">
            search_off
          </span>
          <p className="mt-3 text-sm font-bold text-slate-800">
            Không tìm thấy hồ sơ phù hợp
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Thử thay đổi từ khóa hoặc bộ lọc đang chọn.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 text-[11px] text-slate-500">
          <span>
            Hiển thị{" "}
            <strong className="text-slate-800">{profiles.length}</strong> /{" "}
            {total} hồ sơ
          </span>
          <div className="flex items-center gap-1">
            <button
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300"
              disabled
            >
              <span className="material-symbols-outlined text-[17px]">
                chevron_left
              </span>
            </button>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 font-bold text-white">
              1
            </span>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300"
              disabled
            >
              <span className="material-symbols-outlined text-[17px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
