import { providerProfileRepo } from "@/entities/provider-profile";
import { findRecentBookings } from "@/entities/recent-bookings";
import { userRepo } from "@/entities/user";
import {
  getAdminReportData,
  parseAdminReportQuery,
} from "@/features/admin/reports";
import type { AdminDashboardData } from "./types";

export const DASHBOARD_RANGE = "30d";
const PENDING_LIMIT = 5;
const USERS_LIMIT = 5;
const BOOKINGS_LIMIT = 8;

export async function getAdminDashboardData(
  now = new Date(),
): Promise<AdminDashboardData> {
  const [report, pending, userSummary, recentUsers, recentBookings] =
    await Promise.all([
      // Cùng cách tính với trang báo cáo, kỳ 30 ngày (link "Xem báo cáo" trỏ đúng kỳ này)
      getAdminReportData(parseAdminReportQuery({ range: DASHBOARD_RANGE }), now),
      providerProfileRepo.findRecentPending(PENDING_LIMIT),
      userRepo.countSummaryForAdmin(),
      userRepo.findRecentSignups(USERS_LIMIT),
      findRecentBookings({ all: true }, BOOKINGS_LIMIT),
    ]);

  return {
    report: {
      periodLabel: report.periodLabel,
      updatedAt: report.updatedAt,
      stats: report.stats,
      revenue: report.revenue,
      previousRevenue: report.previousRevenue,
      feeValues: report.feeValues,
      kinds: report.kinds,
      approvals: report.approvals,
      insight: report.insight,
    },
    pendingProfiles: pending.map((p) => ({
      id: p.id,
      businessName: p.businessName,
      businessType: p.businessType,
      ownerName: p.user.fullname,
      submittedAt: p.updatedAt,
    })),
    userSummary,
    recentUsers,
    recentBookings,
  };
}
