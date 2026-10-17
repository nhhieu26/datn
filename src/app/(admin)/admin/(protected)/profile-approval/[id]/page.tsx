import { providerProfileRepo } from "@/entities/provider-profile";
import { ProfileApprovalDetail } from "@/features/admin";
import type { ApprovalProfileDetail } from "@/features/admin/profile-approval";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Chi tiết hồ sơ đối tác | Roamly Admin",
  description: "Xem và kiểm duyệt chi tiết hồ sơ nhà cung cấp trên Roamly.",
};

export default async function ProfileApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  const profile = await providerProfileRepo.findForApprovalById(id);
  if (!profile || profile.approvalStatus === "not_submitted") notFound();

  const { _count, ...rest } = profile;
  const detail: ApprovalProfileDetail = {
    ...rest,
    approvalStatus: profile.approvalStatus,
    serviceCount: {
      tour: _count.tours,
      hotel: _count.hotels,
      restaurant: _count.restaurants,
    }[profile.businessType],
    paypalLinkedAt: profile.paypalLinkedAt.toISOString(),
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
    user: {
      ...profile.user,
      createdAt: profile.user.createdAt.toISOString(),
    },
  };

  return <ProfileApprovalDetail profile={detail} />;
}
