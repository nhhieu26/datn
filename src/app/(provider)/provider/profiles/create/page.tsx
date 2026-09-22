import { ProfileForm } from "@/features/provider/profiles";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roamly - Tạo Hồ sơ Doanh nghiệp | Kênh Đối tác",
};

const initialValues = {
  businessName: "",
  businessType: "tour" as const,
  taxCode: "",
  address: "",
  description: "",
  legalDocUrl: "",
  websiteUrl: "",
  logo: "",
};

export default function CreateProfilePage() {
  return (
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <ProfileForm initialValues={initialValues} mode="create" />
    </main>
  );
}
