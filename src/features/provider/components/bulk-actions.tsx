"use client";

import type { ServiceStatus } from "@/generated/prisma/client";
import { useEffect, useRef } from "react";

const checkboxClass =
  "size-4 shrink-0 rounded-sm border-line-3 bg-transparent text-primary shadow-2xs checked:border-primary-checked checked:bg-primary-checked focus:ring-0 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50";

const toggleButtonClass =
  "hs-dropdown-toggle relative inline-flex items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer px-3 py-2 text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

const menuItemClass =
  "flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:bg-dropdown-item-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

export function SelectionCheckbox({
  checked,
  indeterminate = false,
  disabled = false,
  label,
  title,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label: string;
  title?: string;
  onChange: (checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  // `indeterminate` chỉ đặt được qua DOM, không có thuộc tính HTML tương ứng
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className="flex" title={title}>
      <input
        checked={checked}
        className={checkboxClass}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        ref={ref}
        type="checkbox"
      />
      <span className="sr-only">{label}</span>
    </label>
  );
}

type IconName = "more" | "published" | "paused" | "trash";

function Icon({ name }: { name: IconName }) {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {name === "more" ? (
        <>
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </>
      ) : null}
      {name === "published" ? <path d="M20 6 9 17l-5-5" /> : null}
      {name === "paused" ? (
        <>
          <rect height="16" rx="1" width="4" x="6" y="4" />
          <rect height="16" rx="1" width="4" x="14" y="4" />
        </>
      ) : null}
      {name === "trash" ? (
        <>
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </>
      ) : null}
    </svg>
  );
}

/**
 * Nút "⋯" trên thanh công cụ, áp dụng thao tác cho các dòng đang chọn.
 * Dùng dropdown của Preline: trang cần gọi HSDropdown.autoInit() sau khi render.
 */
export function BulkActionsDropdown({
  id,
  count,
  unitLabel,
  isPending,
  onChangeStatus,
  onDelete,
}: {
  id: string;
  count: number;
  unitLabel: string;
  isPending: boolean;
  onChangeStatus: (status: ServiceStatus) => void;
  onDelete: () => void;
}) {
  const disabled = count === 0 || isPending;

  return (
    <div className="hs-dropdown relative inline-flex [--placement:bottom-right]">
      <button
        aria-busy={isPending}
        aria-expanded="false"
        aria-haspopup="menu"
        aria-label={`Thao tác với ${unitLabel} đã chọn`}
        className={toggleButtonClass}
        id={id}
        title={
          count === 0
            ? `Chọn ${unitLabel} trong bảng để thao tác hàng loạt`
            : undefined
        }
        type="button"
      >
        <Icon name="more" />
        {count > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
            {count}
          </span>
        ) : null}
      </button>

      <div
        aria-labelledby={id}
        aria-orientation="vertical"
        className="hs-dropdown-menu duration z-20 hidden min-w-52 rounded-xl border border-dropdown-line bg-dropdown opacity-0 shadow-xl transition-[opacity,margin] hs-dropdown-open:opacity-100"
        role="menu"
      >
        <p className="border-b border-dropdown-divider px-4 py-2.5 text-xs text-muted-foreground-1">
          {isPending
            ? "Đang cập nhật…"
            : count === 0
              ? `Chưa chọn ${unitLabel} nào`
              : `Đã chọn ${count} ${unitLabel}`}
        </p>
        <div className="space-y-0.5 p-1">
          <button
            className={menuItemClass}
            disabled={disabled}
            onClick={() => onChangeStatus("published")}
            type="button"
          >
            <Icon name="published" />
            Mở bán
          </button>
          <button
            className={menuItemClass}
            disabled={disabled}
            onClick={() => onChangeStatus("paused")}
            type="button"
          >
            <Icon name="paused" />
            Tạm dừng
          </button>
        </div>
        <div className="space-y-0.5 border-t border-dropdown-divider p-1">
          <button
            className="flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
            disabled={disabled}
            onClick={onDelete}
            type="button"
          >
            <Icon name="trash" />
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
