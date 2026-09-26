import {
  approvalProfiles,
  ProfileApprovalDashboard,
} from "@/features/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Duyệt hồ sơ đối tác | Roamly Admin",
  description: "Giao diện kiểm duyệt hồ sơ nhà cung cấp trên Roamly.",
};

export default function ProfileApprovalPage() {
  return <ProfileApprovalDashboard initialProfiles={approvalProfiles} />;
}
