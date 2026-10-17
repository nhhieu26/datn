import { ApprovalIcon } from "./approval-icon";
import {
  inputClass,
  layerButtonClass,
  type ApprovalCounts,
  type StatusFilter,
  type TypeFilter,
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
    <div className="grid gap-3 border-b border-card-line px-6 py-4">
      <div className="grid gap-3 md:flex md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 start-0 z-20 flex items-center ps-3.5">
            <ApprovalIcon
              name="search"
              className="size-4 text-muted-foreground"
            />
          </div>
          <label className="sr-only" htmlFor="hs-approval-search">
            Tìm kiếm hồ sơ
          </label>
          <input
            className={`${inputClass} w-full ps-10 pe-4`}
            id="hs-approval-search"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm doanh nghiệp, MST, người đại diện..."
            type="text"
            value={search}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Lọc theo loại hình"
            className={`${inputClass} ps-3 pe-9`}
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
          <button
            className={`px-3 py-2 ${layerButtonClass}`}
            onClick={onReset}
            type="button"
          >
            <ApprovalIcon name="reset" />
            Đặt lại
          </button>
        </div>
      </div>

      <nav
        aria-label="Lọc theo trạng thái"
        className="flex w-fit max-w-full gap-x-1 overflow-x-auto rounded-lg bg-surface p-1"
        role="tablist"
      >
        {(
          [
            ["all", "Tất cả", counts.all],
            ["pending", "Chờ duyệt", counts.pending],
            ["approved", "Đã duyệt", counts.approved],
            ["rejected", "Từ chối", counts.rejected],
          ] as const
        ).map(([value, label, count]) => {
          const active = statusFilter === value;
          return (
            <button
              aria-selected={active}
              className={`inline-flex items-center gap-x-2 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap focus:outline-hidden ${
                active
                  ? "bg-layer text-layer-foreground shadow-2xs"
                  : "text-muted-foreground-2 hover:text-foreground focus:text-foreground"
              }`}
              key={value}
              onClick={() => onStatusFilterChange(value)}
              role="tab"
              type="button"
            >
              {label}
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-1 text-surface-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
