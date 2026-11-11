import { AdminReports } from "@/features/admin";
import { getAdminReportData, parseAdminReportQuery } from "@/features/admin/reports";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Báo cáo & thống kê | Roamly Admin",
  description: "Doanh thu nền tảng, đơn đặt, người dùng và bảng xếp hạng toàn sàn Roamly.",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin/sign-in");

  const query = parseAdminReportQuery(await searchParams);
  const data = await getAdminReportData(query);

  return <AdminReports data={data} query={query} />;
}
