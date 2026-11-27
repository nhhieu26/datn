import type { BusinessType } from "@/generated/prisma/client";
import type { RecentBooking } from "@/entities/recent-bookings";
import type { Role, UserStatus } from "@/entities/user";
import type { AdminReportData } from "@/features/admin/reports";

export type AdminPendingProfile = {
  id: string;
  businessName: string;
  businessType: BusinessType;
  ownerName: string;
  submittedAt: Date;
};

export type AdminRecentUser = {
  id: string;
  fullname: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
};

export type AdminUserSummary = {
  total: number;
  customers: number;
  providers: number;
  banned: number;
};

export type AdminDashboardData = {
  report: Pick<
    AdminReportData,
    | "periodLabel"
    | "updatedAt"
    | "stats"
    | "revenue"
    | "previousRevenue"
    | "feeValues"
    | "kinds"
    | "approvals"
    | "insight"
  >;
  pendingProfiles: AdminPendingProfile[];
  userSummary: AdminUserSummary;
  recentUsers: AdminRecentUser[];
  recentBookings: RecentBooking[];
};
