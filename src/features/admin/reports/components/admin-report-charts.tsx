"use client";

import { useId } from "react";
import { formatCurrency } from "@/lib/utils";
import { formatCompact } from "@/features/provider/dashboard/utils";
import type { AdminKindSummary, AdminUserGrowth } from "../types";
import {
  AXIS_LABEL_STYLE,
  tooltipRow,
  tooltipShell,
  usePrelineChart,
} from "./use-preline-chart";

type TooltipProps = { dataPointIndex: number; series: number[][] };

const GRAY = "#9ca3af";
const TEAL = "#14b8a6";
const AMBER = "#f59e0b";
const PRIMARY_FALLBACK = "#2563eb";
const GRID_LIGHT = "#e5e7eb";
const GRID_DARK = "#404040";

const useChartId = (prefix: string) => `${prefix}-${useId().replace(/[^\w-]/g, "")}`;

/** GMV kỳ này (vùng) so với kỳ trước (nét đứt); tooltip kèm hoa hồng sàn. */
export function AdminRevenueChart({
  labels,
  values,
  previousValues,
  feeValues,
}: {
  labels: string[];
  values: number[];
  previousValues: number[];
  feeValues: number[];
}) {
  const id = useChartId("admin-revenue-chart");
  const dataKey = JSON.stringify({ labels, values, previousValues, feeValues });

  usePrelineChart(id, dataKey, (colorOf) => {
    const primary = colorOf("--color-primary-600", PRIMARY_FALLBACK);
    const colors = [primary, GRAY];
    return {
      options: (mode) => ({
        chart: {
          height: "100%",
          type: "area",
          toolbar: { show: false },
          zoom: { enabled: false },
          fontFamily: "Inter, ui-sans-serif",
        },
        series: [
          { name: "GMV", data: values },
          { name: "Kỳ trước", data: previousValues },
        ],
        legend: { show: false },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 2, dashArray: [0, 5] },
        grid: { strokeDashArray: 3 },
        fill: {
          type: "gradient",
          gradient: { type: "vertical", shadeIntensity: 1, opacityFrom: [0.25, 0], opacityTo: 0 },
        },
        xaxis: {
          type: "category",
          tickPlacement: "on",
          categories: labels,
          axisBorder: { show: false },
          axisTicks: { show: false },
          crosshairs: { stroke: { dashArray: 0 } },
          tooltip: { enabled: false },
          labels: { style: AXIS_LABEL_STYLE, hideOverlappingLabels: true, rotate: 0 },
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
          custom: ({ dataPointIndex: i, series }: TooltipProps) =>
            tooltipShell(
              mode,
              labels[i],
              tooltipRow(primary, "GMV", formatCurrency(series[0][i])) +
                tooltipRow(TEAL, "Hoa hồng", formatCurrency(feeValues[i] ?? 0)) +
                tooltipRow(GRAY, "Kỳ trước", formatCurrency(series[1][i])),
            ),
        },
      }),
      light: () => ({ colors, grid: { borderColor: GRID_LIGHT } }),
      dark: () => ({ colors, grid: { borderColor: GRID_DARK } }),
    };
  });

  return (
    <div
      id={id}
      className="min-h-72 w-full"
      role="img"
      aria-label="Biểu đồ GMV toàn sàn theo thời gian, so với kỳ trước"
    />
  );
}

/** Tỷ trọng đơn đặt theo loại dịch vụ. */
export function BookingsDonutChart({ kinds }: { kinds: AdminKindSummary[] }) {
  const id = useChartId("admin-bookings-donut");
  const labels = kinds.map((k) => k.label);
  const values = kinds.map((k) => k.bookings);
  const total = values.reduce((a, b) => a + b, 0);
  const dataKey = JSON.stringify({ labels, values });

  usePrelineChart(id, dataKey, (colorOf) => {
    const colors = [colorOf("--color-primary-600", PRIMARY_FALLBACK), TEAL, AMBER];
    return {
      options: (mode) => ({
        chart: { height: 220, width: 220, type: "donut", fontFamily: "Inter, ui-sans-serif" },
        series: total ? values : [1],
        labels: total ? labels : ["Chưa có đơn"],
        legend: { show: false },
        dataLabels: { enabled: false },
        stroke: { width: 4 },
        plotOptions: {
          pie: {
            donut: {
              size: "76%",
              labels: {
                show: true,
                name: { show: true, fontSize: "12px", offsetY: 18 },
                value: {
                  show: true,
                  fontSize: "22px",
                  fontWeight: 600,
                  offsetY: -14,
                  formatter: (v) => (total ? Number(v).toLocaleString("vi-VN") : "0"),
                },
                total: {
                  show: true,
                  label: "Tổng đơn",
                  fontSize: "12px",
                  formatter: () => total.toLocaleString("vi-VN"),
                },
              },
            },
          },
        },
        states: { hover: { filter: { type: total ? "darken" : "none" } } },
        tooltip: {
          enabled: total > 0,
          custom: ({ seriesIndex }: { seriesIndex: number }) =>
            tooltipShell(
              mode,
              labels[seriesIndex],
              tooltipRow(
                colors[seriesIndex],
                "Số đơn",
                `${values[seriesIndex].toLocaleString("vi-VN")} (${Math.round((values[seriesIndex] / total) * 100)}%)`,
              ),
            ),
        },
      }),
      light: () => ({
        colors: total ? colors : ["#e5e7eb"],
        stroke: { colors: ["#ffffff"] },
        plotOptions: { pie: { donut: { labels: { name: { color: GRAY }, value: { color: "#1f2937" }, total: { color: GRAY } } } } },
      }),
      dark: () => ({
        colors: total ? colors : ["#404040"],
        stroke: { colors: ["#262626"] },
        plotOptions: { pie: { donut: { labels: { name: { color: GRAY }, value: { color: "#e5e5e5" }, total: { color: GRAY } } } } },
      }),
    };
  });

  return (
    <div
      id={id}
      className="flex min-h-56 justify-center"
      role="img"
      aria-label="Biểu đồ tỷ trọng đơn đặt theo loại dịch vụ"
    />
  );
}

/** Tài khoản khách hàng và đối tác mới theo kỳ. */
export function UserGrowthChart({ growth }: { growth: AdminUserGrowth }) {
  const id = useChartId("admin-user-growth");
  const { labels, customers, providers } = growth;
  const dataKey = JSON.stringify({ labels, customers, providers });

  usePrelineChart(id, dataKey, (colorOf) => {
    const colors = [colorOf("--color-primary-600", PRIMARY_FALLBACK), TEAL];
    return {
      options: (mode) => ({
        chart: {
          height: "100%",
          type: "bar",
          stacked: true,
          toolbar: { show: false },
          zoom: { enabled: false },
          fontFamily: "Inter, ui-sans-serif",
        },
        series: [
          { name: "Khách hàng", data: customers },
          { name: "Đối tác", data: providers },
        ],
        plotOptions: { bar: { columnWidth: "45%", borderRadius: 3, borderRadiusApplication: "end", borderRadiusWhenStacked: "last" } },
        legend: { show: false },
        dataLabels: { enabled: false },
        grid: { strokeDashArray: 3 },
        xaxis: {
          categories: labels,
          axisBorder: { show: false },
          axisTicks: { show: false },
          crosshairs: { show: false },
          tooltip: { enabled: false },
          labels: { style: AXIS_LABEL_STYLE, hideOverlappingLabels: true, rotate: 0 },
        },
        yaxis: {
          min: 0,
          forceNiceScale: true,
          labels: {
            align: "left",
            minWidth: 0,
            style: AXIS_LABEL_STYLE,
            formatter: (v) => Math.round(v).toLocaleString("vi-VN"),
          },
        },
        tooltip: {
          custom: ({ dataPointIndex: i, series }: TooltipProps) =>
            tooltipShell(
              mode,
              labels[i],
              tooltipRow(colors[0], "Khách hàng", series[0][i].toLocaleString("vi-VN")) +
                tooltipRow(colors[1], "Đối tác", series[1][i].toLocaleString("vi-VN")),
            ),
        },
      }),
      light: () => ({ colors, grid: { borderColor: GRID_LIGHT } }),
      dark: () => ({ colors, grid: { borderColor: GRID_DARK } }),
    };
  });

  return (
    <div
      id={id}
      className="min-h-60 w-full flex-1"
      role="img"
      aria-label="Biểu đồ tài khoản mới theo thời gian"
    />
  );
}
