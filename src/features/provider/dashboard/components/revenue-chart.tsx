"use client";

import type { ApexOptions } from "apexcharts";
import { useEffect, useId } from "react";
import { formatCurrency } from "@/lib/utils";
import type { DashboardChart } from "../types";
import { formatCompact } from "../utils";

type ChartInstance = { destroy: () => void };

type TooltipProps = { dataPointIndex: number; series: number[][] };

const AXIS_LABEL_STYLE = {
  colors: "#9ca3af",
  fontSize: "12px",
  fontFamily: "Inter, ui-sans-serif",
  fontWeight: 400,
};

export function RevenueChart({ chart }: { chart: DashboardChart }) {
  const id = `provider-revenue-chart-${useId().replace(/[^\w-]/g, "")}`;
  // Server trả mảng mới mỗi lần render nên so sánh theo nội dung
  const dataKey = JSON.stringify(chart);

  useEffect(() => {
    const { title, labels, values, unit } = JSON.parse(dataKey) as DashboardChart;
    const formatValue = (v: number) =>
      unit === "currency" ? formatCurrency(v) : `${v.toLocaleString("vi-VN")} khách`;

    let chartInstance: ChartInstance | false | null = null;
    let cancelled = false;

    (async () => {
      const [{ default: lodash }, { buildChart }, { varToColor }] = await Promise.all([
        import("lodash"),
        import("preline/helpers/apexcharts"),
        import("preline/helpers/shared"),
      ]);
      if (cancelled) return;
      // helper của Preline gọi window._.merge
      (window as Window & { _?: typeof lodash })._ = lodash;

      const primary = varToColor("--color-primary-600") ?? "#2563eb";

      chartInstance = buildChart(
        `#${id}`,
        (mode: "light" | "dark"): ApexOptions => ({
          chart: {
            height: 256,
            type: "area",
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: "Inter, ui-sans-serif",
          },
          series: [{ name: title, data: values }],
          legend: { show: false },
          dataLabels: { enabled: false },
          stroke: { curve: "smooth", width: 2 },
          grid: { strokeDashArray: 3 },
          fill: {
            type: "gradient",
            gradient: { type: "vertical", shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0 },
          },
          xaxis: {
            type: "category",
            tickPlacement: "on",
            categories: labels,
            axisBorder: { show: false },
            axisTicks: { show: false },
            crosshairs: { stroke: { dashArray: 0 } },
            tooltip: { enabled: false },
            labels: {
              style: AXIS_LABEL_STYLE,
              hideOverlappingLabels: true,
              rotate: 0,
            },
          },
          yaxis: {
            min: 0,
            forceNiceScale: true,
            labels: {
              align: "left",
              minWidth: 0,
              maxWidth: 140,
              style: AXIS_LABEL_STYLE,
              formatter: (v) => formatCompact(v),
            },
          },
          tooltip: {
            custom: ({ dataPointIndex, series }: TooltipProps) => `
              <div class="${mode === "dark" ? "dark " : ""}min-w-36 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-md dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                <div class="border-b border-gray-200 px-3 py-1.5 text-xs font-semibold dark:border-neutral-700">${labels[dataPointIndex]}</div>
                <div class="flex items-center gap-x-2 px-3 py-1.5 text-xs">
                  <span class="size-2.5 shrink-0 rounded-xs" style="background:${primary}"></span>
                  <span class="text-gray-500 dark:text-neutral-400">${title}</span>
                  <span class="ms-auto font-medium">${formatValue(series[0][dataPointIndex])}</span>
                </div>
              </div>`,
          },
        }),
        () => ({ colors: [primary], grid: { borderColor: "#e5e7eb" } }),
        () => ({ colors: [primary], grid: { borderColor: "#404040" } }),
      );
    })();

    return () => {
      cancelled = true;
      if (chartInstance) chartInstance.destroy();
    };
  }, [id, dataKey]);

  return (
    <div
      id={id}
      className="h-64 w-full"
      role="img"
      aria-label={`Biểu đồ ${chart.title.toLowerCase()} theo thời gian`}
    />
  );
}
