import { auth } from "@/lib/auth";
import { providerProfileRepo } from "@/entities/provider-profile";
import {
  DashboardEmpty,
  ProviderDashboard,
  getDashboardData,
  parseDashboardQuery,
} from "@/features/provider/dashboard";
import type { BusinessType } from "@/generated/prisma/client";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Tổng quan | Kênh Đối tác",
};

const TYPE_ORDER: BusinessType[] = ["tour", "hotel", "restaurant"];

export default async function ProviderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const query = parseDashboardQuery(await searchParams);

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

  const data = await getDashboardData(kind, profile.id, query.range);
  return <ProviderDashboard data={data} range={query.range} />;
}
