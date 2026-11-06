import type { BusinessType } from "@/generated/prisma/client";
import type { DashboardChart } from "../dashboard/types";
import type { Trend } from "../dashboard/utils";

export type ReportStatKey = "average" | "completion" | "cancellation" | "primary";

export type ReportStat = {
  key: ReportStatKey;
  label: string;
  value: string;
  trend: Trend;
};

export type ReportFunnelStage = {
  label: string;
  count: number;
  /** Tỷ lệ so với tầng đầu của phễu, 0-100. */
  percent: number;
};

export type ReportData = {
  kind: BusinessType;
  periodLabel: string;
  updatedAt: Date;
  chart: DashboardChart;
  previousValues: number[];
  stats: ReportStat[];
  funnel: ReportFunnelStage[];
  insight: string;
};
