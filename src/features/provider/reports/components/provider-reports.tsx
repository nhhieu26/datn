import type { ReactNode } from "react";
import { formatDateTime, todayIsoDate } from "@/lib/utils";
import {
  moneyIcon,
  StrokeIcon,
  trendClass,
  usersIcon,
} from "../../dashboard/components/provider-dashboard";
import { RevenueChart } from "../../dashboard/components/revenue-chart";
import { buildReportUrl, REPORT_PATH, type ReportQuery } from "../search-params";
import type { ReportData, ReportStatKey } from "../types";
import { ReportExportButton } from "./report-export-button";
import { ReportRangeDropdown } from "./report-range-dropdown";
import { ReportRefreshButton } from "./report-refresh-button";

const statIcons: Record<ReportStatKey, ReactNode> = {
  average: (
    <>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </>
  ),
  completion: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  cancellation: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </>
  ),
  primary: moneyIcon,
};

const FUNNEL_BAR_CLASSES = ["bg-primary-600", "bg-primary-400", "bg-primary-300"];

export function ProviderReports({ data, query }: { data: ReportData; query: ReportQuery }) {
  const isRestaurant = data.kind === "restaurant";

  return (
    <main className="flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-6 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Báo cáo & Thống kê</h1>
          <div className="flex items-center gap-x-1 text-sm text-muted-foreground-1">
            <span>Dữ liệu cập nhật lúc {formatDateTime(data.updatedAt)}</span>
            <ReportRefreshButton />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ReportRangeDropdown
            presetHrefs={{
              "7d": buildReportUrl(data.kind, "7d"),
              "30d": buildReportUrl(data.kind, "30d"),
              "12m": buildReportUrl(data.kind, "12m"),
            }}
            action={REPORT_PATH}
            hiddenFields={{ type: data.kind }}
            range={query.range}
            label={data.periodLabel}
            from={query.from}
            to={query.to}
            today={todayIsoDate(data.updatedAt)}
          />
          <ReportExportButton
            chart={data.chart}
            previousValues={data.previousValues}
            filename={`bao-cao-${data.kind}-${query.range === "custom" ? `${query.from}-${query.to}` : query.range}.csv`}
          />
        </div>
      </div>

      {/* Biểu đồ tăng trưởng */}
      <div className="flex min-w-0 flex-col rounded-xl border border-card-line bg-card shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-3 p-4 md:p-5">
          <div>
            <h2 className="font-semibold text-foreground">
              {isRestaurant ? "Tăng trưởng lượt khách" : "Tăng trưởng doanh thu"}
            </h2>
            <p className="text-sm text-muted-foreground-1">
              Hiệu suất trong <span className="font-medium text-primary-600">{data.periodLabel}</span>
            </p>
          </div>
          <div className="flex items-center gap-x-4 text-xs text-muted-foreground-1">
            <span className="inline-flex items-center gap-x-1.5">
              <span className="size-2.5 rounded-full bg-primary-600" />
              {data.chart.title}
            </span>
            <span className="inline-flex items-center gap-x-1.5">
              <span className="size-2.5 rounded-full bg-gray-400" />
              Kỳ trước
            </span>
          </div>
        </div>
        <div className="px-2 pb-4 md:px-3 md:pb-5">
          <RevenueChart chart={data.chart} previousValues={data.previousValues} />
        </div>
      </div>

      {/* Thẻ KPI */}
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {data.stats.map((s) => (
          <div key={s.key} className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
            <div className="p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                  <StrokeIcon>
                    {isRestaurant && (s.key === "primary" || s.key === "average")
                      ? usersIcon
                      : statIcons[s.key]}
                  </StrokeIcon>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${trendClass(s.trend.up)}`}
                  title="So với kỳ trước"
                >
                  {s.trend.label}
                </span>
              </div>
              <p className="mt-4 text-xs tracking-wide text-muted-foreground-1 uppercase">{s.label}</p>
              <h3 className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Phễu đơn đặt */}
      <div className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
        <div className="p-4 md:p-5">
          <h2 className="font-semibold text-foreground">Phễu đơn đặt</h2>
          <p className="text-sm text-muted-foreground-1">Hành trình của đơn từ lúc đặt đến khi hoàn thành</p>
        </div>
        <div className="space-y-5 px-4 pb-4 md:px-5 md:pb-5">
          {data.funnel.map((stage, i) => (
            <div key={stage.label} className="grid items-center gap-x-4 gap-y-1 sm:grid-cols-[9rem_1fr_7rem]">
              <p className="text-sm font-medium text-foreground">{stage.label}</p>
              <div
                className="flex h-7 w-full overflow-hidden rounded-lg bg-surface"
                role="progressbar"
                aria-label={stage.label}
                aria-valuenow={stage.percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`rounded-lg transition-all duration-500 ${FUNNEL_BAR_CLASSES[i]}`}
                  style={{ width: `${stage.percent}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground-1 sm:text-end">
                <span className="font-medium text-foreground">{stage.count.toLocaleString("vi-VN")}</span>
                {` · ${stage.percent.toLocaleString("vi-VN")}%`}
              </p>
            </div>
          ))}

          <div className="flex items-start gap-x-2 rounded-lg border border-primary-200 bg-primary-50 p-4 text-sm font-medium text-primary-800" role="status">
            <svg className="mt-0.5 size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 7h6v6" />
              <path d="m22 7-8.5 8.5-5-5L2 17" />
            </svg>
            {data.insight}
          </div>
        </div>
      </div>
    </main>
  );
}
