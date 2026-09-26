import { providerProfileRepo } from "@/entities/provider-profile";
import { ProfileApprovalDashboard } from "@/features/admin";
import type { ApprovalProfile } from "@/features/admin/profile-approval";
import type { Metadata } from "next";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Duyệt hồ sơ đối tác | Roamly Admin",
  description: "Giao diện kiểm duyệt hồ sơ nhà cung cấp trên Roamly.",
};

export default async function ProfileApprovalPage() {
  await connection();

  const profiles = await providerProfileRepo.findAllForApproval();
  const initialProfiles: ApprovalProfile[] = profiles.map((profile) => {
    if (profile.approvalStatus === "not_submitted") {
      throw new Error("Hồ sơ chưa nộp không thuộc danh sách xét duyệt.");
    }

    return {
      ...profile,
      approvalStatus: profile.approvalStatus,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  });

  return <ProfileApprovalDashboard initialProfiles={initialProfiles} />;
}
