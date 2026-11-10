import { provinceRepo } from "@/entities/province";
import { systemSettingRepo } from "@/entities/system-setting";
import { tagRepo } from "@/entities/tag";
import { userRepo } from "@/entities/user";
import {
  mapProvinceToAdminItem,
  mapTagToAdminItem,
  SystemSettingsDashboard,
} from "@/features/admin/settings";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Cấu hình hệ thống | Roamly Admin",
  description:
    "Quản lý thông số vận hành, thanh toán, danh mục hệ thống và tài khoản quản trị Roamly.",
};

export default async function AdminSystemSettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/sign-in");
  }

  const [settings, rawTags, rawProvinces, profile] = await Promise.all([
    systemSettingRepo.getSettings(),
    tagRepo.findAllWithUsageCount(),
    provinceRepo.findAllWithUsageCount(),
    userRepo.findProfileById(session.user.id),
  ]);

  if (!profile) {
    redirect("/admin/sign-in");
  }

  return (
    <SystemSettingsDashboard
      initialData={{
        settings,
        tags: rawTags.map(mapTagToAdminItem),
        provinces: rawProvinces.map(mapProvinceToAdminItem),
        adminProfile: {
          id: session.user.id,
          fullname: profile.fullname,
          email: profile.email,
          phone: profile.phone,
          createdAt: profile.createdAt.toISOString(),
        },
      }}
    />
  );
}
