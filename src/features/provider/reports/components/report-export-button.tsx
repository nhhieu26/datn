"use client";

import type { DashboardChart } from "../../dashboard/types";

export function ReportExportButton({
  chart,
  previousValues,
  filename,
}: {
  chart: DashboardChart;
  previousValues: number[];
  filename: string;
}) {
  function handleExport() {
    const rows = [
      ["Kỳ", `${chart.title} kỳ này`, `${chart.title} kỳ trước`],
      ...chart.labels.map((label, i) => [label, chart.values[i], previousValues[i]]),
    ];
    // BOM để Excel đọc đúng tiếng Việt
    const csv = `﻿${rows.map((row) => row.join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-x-2 rounded-lg border border-layer-line bg-layer px-3 py-2 text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden"
    >
      <svg
        className="size-4 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
      </svg>
      Xuất CSV
    </button>
  );
}
