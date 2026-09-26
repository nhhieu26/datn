import type {
  ApprovalCounts,
  StatusFilter,
  TypeFilter,
} from "./approval-shared";

export function ApprovalFilterBar({
  counts,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  onReset,
}: {
  counts: ApprovalCounts;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200/80 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative min-w-0 flex-1">
          <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[19px] text-slate-400">
            search
          </span>
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-10 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm doanh nghiệp, MST, người đại diện..."
            value={search}
          />
        </label>
        <div className="flex gap-2">
          <label className="relative flex-1 sm:flex-none">
            <select
              className="h-full min-w-48 appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-9 pl-3.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-brand-400"
              onChange={(event) =>
                onTypeFilterChange(event.target.value as TypeFilter)
              }
              value={typeFilter}
            >
              <option value="all">Tất cả loại hình</option>
              <option value="tour">Tour du lịch</option>
              <option value="hotel">Khách sạn &amp; Lưu trú</option>
              <option value="restaurant">Nhà hàng &amp; Ẩm thực</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[18px] text-slate-400">
              expand_more
            </span>
          </label>
          <button
            className="flex items-center justify-center self-stretch rounded-xl border border-slate-200 px-2.5 text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-800"
            onClick={onReset}
            title="Đặt lại bộ lọc"
            type="button"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              refresh
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["all", "Tất cả", counts.all],
            ["pending", "Chờ duyệt", counts.pending],
            ["approved", "Đã duyệt", counts.approved],
            ["rejected", "Từ chối", counts.rejected],
          ] as const
        ).map(([value, label, count]) => (
          <button
            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
              statusFilter === value
                ? "bg-brand-500 text-white shadow-sm shadow-brand-500/20"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
            key={value}
            onClick={() => onStatusFilterChange(value)}
            type="button"
          >
            {label}
            <span
              className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                statusFilter === value ? "bg-white/15" : "bg-slate-100"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
