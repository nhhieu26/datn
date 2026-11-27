"use client";

import type { ApexOptions } from "apexcharts";
import { useEffect, useEffectEvent } from "react";

type ChartInstance = { destroy: () => void };
type Mode = "light" | "dark";

export type PrelineChartSetup = {
  options: (mode: Mode) => ApexOptions;
  light: () => ApexOptions;
  dark: () => ApexOptions;
};

/** Màu Preline theo biến CSS, có màu dự phòng khi biến chưa sẵn sàng. */
export type ColorOf = (cssVar: string, fallback: string) => string;

/**
 * Vẽ biểu đồ ApexCharts bằng helper `buildChart` của Preline (tự đổi theme sáng/tối).
 * Biểu đồ dựng lại khi `dataKey` đổi; `setup` luôn đọc dữ liệu mới nhất.
 */
export function usePrelineChart(
  id: string,
  dataKey: string,
  setup: (colorOf: ColorOf) => PrelineChartSetup,
) {
  const getSetup = useEffectEvent(setup);

  useEffect(() => {
    let instance: ChartInstance | false | null = null;
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

      const colorOf: ColorOf = (cssVar, fallback) => varToColor(cssVar) ?? fallback;
      const { options, light, dark } = getSetup(colorOf);
      instance = buildChart(`#${id}`, options, light, dark);
    })();

    return () => {
      cancelled = true;
      if (instance) instance.destroy();
    };
  }, [id, dataKey]);
}

export const AXIS_LABEL_STYLE = {
  colors: "#9ca3af",
  fontSize: "12px",
  fontFamily: "Inter, ui-sans-serif",
  fontWeight: 400,
};

export const tooltipShell = (mode: Mode, title: string, body: string) => `
  <div class="${mode === "dark" ? "dark " : ""}min-w-40 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-md dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
    <div class="border-b border-gray-200 px-3 py-1.5 text-xs font-semibold dark:border-neutral-700">${title}</div>
    ${body}
  </div>`;

export const tooltipRow = (color: string, label: string, value: string) => `
  <div class="flex items-center gap-x-2 px-3 py-1.5 text-xs">
    <span class="size-2.5 shrink-0 rounded-xs" style="background:${color}"></span>
    <span class="text-gray-500 dark:text-neutral-400">${label}</span>
    <span class="ms-auto ps-3 font-medium">${value}</span>
  </div>`;
