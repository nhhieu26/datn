import {
  CustomerDashboard,
  getCustomerDashboardData,
} from "@/features/customer/dashboard";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Tổng quan tài khoản",
};

export default async function CustomerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const data = await getCustomerDashboardData(session.user.id);
  return <CustomerDashboard data={data} />;
}
