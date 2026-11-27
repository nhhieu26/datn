import { auth } from "@/lib/auth";
import { providerProfileRepo } from "@/entities/provider-profile";
import { DashboardEmpty } from "@/features/provider/dashboard";
import {
  ProviderReports,
  getReportData,
  parseReportQuery,
} from "@/features/provider/reports";
import type { BusinessType } from "@/generated/prisma/client";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Báo cáo & Thống kê | Kênh Đối tác",
};

const TYPE_ORDER: BusinessType[] = ["tour", "hotel", "restaurant"];

export default async function ProviderReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const query = parseReportQuery(await searchParams);

  // Không có ?type= → hồ sơ đã duyệt đầu tiên theo thứ tự tour → khách sạn → nhà hàng
  let kind = query.type;
  if (!kind) {
    const profiles = await providerProfileRepo.findAllByUserId(session.user.id);
    const approved = new Set(
      profiles.filter((p) => p.approvalStatus === "approved").map((p) => p.businessType),
    );
    kind = TYPE_ORDER.find((t) => approved.has(t)) ?? "tour";
  }

  const profile = await providerProfileRepo.findApprovedByUserIdAndBusinessType(
    session.user.id,
    kind,
  );
  if (!profile) return <DashboardEmpty kind={kind} />;

  const data = await getReportData(kind, profile.id, query);
  return <ProviderReports data={data} query={query} />;
}
