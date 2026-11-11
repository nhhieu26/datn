import type { ApprovalStatus, BusinessType } from "@/generated/prisma/client";
import type { DashboardChart } from "@/features/provider/dashboard/types";
import type { Trend } from "@/features/provider/dashboard/utils";
import type { ReportFunnelStage } from "@/features/provider/reports/types";

export type AdminReportStatKey = "gmv" | "fee" | "bookings" | "users";

export type AdminReportStat = {
  key: AdminReportStatKey;
  label: string;
  value: string;
  /** Số liệu thô dùng khi xuất Excel. */
  raw: number;
  trend: Trend;
};

export type AdminKindSummary = {
  kind: BusinessType;
  label: string;
  bookings: number;
  completed: number;
  cancelled: number;
  completionRate: number;
  cancellationRate: number;
  guests: number;
  gmv: number;
  fee: number;
};

export type AdminTopProvider = {
  id: string;
  name: string;
  kind: BusinessType;
  bookings: number;
  gmv: number;
  fee: number;
  /** Tỷ trọng GMV trên toàn sàn, 0-100. */
  share: number;
};

export type AdminTopProvince = {
  id: string;
  name: string;
  bookings: number;
  /** Tỷ trọng số đơn trên toàn sàn, 0-100. */
  share: number;
};

export type AdminUserGrowth = {
  labels: string[];
  customers: number[];
  providers: number[];
  totalCustomers: number;
  totalProviders: number;
};

export type AdminReportData = {
  periodLabel: string;
  updatedAt: Date;
  /** GMV theo kỳ (đơn đã thanh toán tour + khách sạn). */
  revenue: DashboardChart;
  previousRevenue: number[];
  /** Hoa hồng sàn theo kỳ, cùng nhãn với `revenue`. */
  feeValues: number[];
  stats: AdminReportStat[];
  kinds: AdminKindSummary[];
  funnel: ReportFunnelStage[];
  userGrowth: AdminUserGrowth;
  approvals: Record<ApprovalStatus, number>;
  topProviders: AdminTopProvider[];
  topProvinces: AdminTopProvince[];
  insight: string;
};
