import { AdminDashboard } from "@/features/admin";
import { getAdminDashboardData } from "@/features/admin/dashboard";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Tổng quan | Roamly Admin",
  description: "Số liệu nhanh toàn sàn, hồ sơ chờ duyệt, người dùng và đơn đặt mới nhất.",
};

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin/sign-in");

  const data = await getAdminDashboardData();

  return <AdminDashboard data={data} />;
}
