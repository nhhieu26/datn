"use client";

import Form from "next/form";
import Link from "next/link";
import type { BusinessType } from "@/generated/prisma/client";
import { buildReportUrl, REPORT_PATH, type ReportRange } from "../search-params";

const DROPDOWN_ID = "hs-report-range";

const PRESETS: { value: Exclude<ReportRange, "custom">; label: string }[] = [
  { value: "7d", label: "7 ngày qua" },
  { value: "30d", label: "30 ngày qua" },
  { value: "12m", label: "12 tháng qua" },
];

const dateInputClass =
  "block w-full rounded-lg border-layer-line bg-layer px-3 py-2 text-sm text-foreground focus:border-primary-focus focus:ring-primary-focus";

type HSWindow = Window & {
  HSDropdown?: { close: (target: HTMLElement) => void };
};

// --auto-close:inside giữ menu mở khi thao tác trong form, nên phải tự đóng sau khi chọn
function closeDropdown() {
  const el = document.getElementById(DROPDOWN_ID);
  if (el) (window as HSWindow).HSDropdown?.close(el);
}

export function ReportRangeDropdown({
  kind,
  range,
  label,
  from,
  to,
  today,
}: {
  kind: BusinessType;
  range: ReportRange;
  label: string;
  from: string;
  to: string;
  today: string;
}) {
  return (
    <div
      id={DROPDOWN_ID}
      className="hs-dropdown relative inline-flex [--auto-close:inside] [--placement:bottom-right]"
    >
      <button
        id={`${DROPDOWN_ID}-toggle`}
        type="button"
        className="hs-dropdown-toggle inline-flex items-center gap-x-2 rounded-lg border border-layer-line bg-layer px-3 py-2 text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden"
        aria-haspopup="menu"
        aria-expanded="false"
        aria-label="Chọn khoảng thời gian"
      >
        <svg className="size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
        </svg>
        {label}
        <svg className="size-4 shrink-0 hs-dropdown-open:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        className="hs-dropdown-menu z-20 hidden w-64 rounded-lg border border-dropdown-line bg-dropdown p-1.5 opacity-0 shadow-lg transition-[opacity,margin] hs-dropdown-open:opacity-100"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby={`${DROPDOWN_ID}-toggle`}
      >
        <div className="space-y-0.5">
          {PRESETS.map((preset) => (
            <Link
              key={preset.value}
              href={buildReportUrl(kind, preset.value)}
              scroll={false}
              role="menuitem"
              aria-current={preset.value === range ? "true" : undefined}
              onClick={closeDropdown}
              className={`flex items-center rounded-lg px-3 py-2 text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:bg-dropdown-item-focus focus:outline-hidden ${preset.value === range ? "bg-dropdown-item-active font-medium" : ""}`}
            >
              {preset.label}
            </Link>
          ))}
        </div>

        <Form
          action={REPORT_PATH}
          scroll={false}
          onSubmit={closeDropdown}
          className="mt-1.5 space-y-2 border-t border-dropdown-line px-1.5 pt-3 pb-1.5"
        >
          <input type="hidden" name="type" value={kind} />
          <input type="hidden" name="range" value="custom" />
          <p className="text-xs font-medium text-muted-foreground-1">Tùy chọn khoảng ngày</p>
          <label className="block text-xs text-muted-foreground-1">
            Từ ngày
            <input
              key={`from-${from}`}
              type="date"
              name="from"
              required
              defaultValue={from}
              max={today}
              className={`${dateInputClass} mt-1`}
            />
          </label>
          <label className="block text-xs text-muted-foreground-1">
            Đến ngày
            <input
              key={`to-${to}`}
              type="date"
              name="to"
              required
              defaultValue={to}
              max={today}
              className={`${dateInputClass} mt-1`}
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg border border-transparent bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden"
          >
            Áp dụng
          </button>
        </Form>
      </div>
    </div>
  );
}
