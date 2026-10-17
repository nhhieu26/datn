import { providerProfileRepo } from "@/entities/provider-profile";
import { auth } from "@/lib/auth";
import { ProfileForm } from "@/features/provider/profiles";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { formatUpdatedLabel } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Roamly - Chỉnh sửa Hồ sơ Doanh nghiệp | Kênh Đối tác",
};

export default async function EditProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const { paypal: paypalStatus } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const profile = await providerProfileRepo.findById(id, session.user.id);
  if (!profile) notFound();

  const initialValues = {
    businessName: profile.businessName,
    businessType: profile.businessType,
    taxCode: profile.taxCode ?? "",
    address: profile.address ?? "",
    description: profile.description ?? "",
    legalDocUrl: profile.licenseUrl ?? "",
    websiteUrl: profile.website ?? "",
    logo: profile.photoUrl ?? "",
  };

  const rejection =
    profile.approvalStatus === "rejected" && profile.rejectionReason
      ? {
          reason: profile.rejectionReason,
          timestamp: formatUpdatedLabel(profile.updatedAt),
        }
      : undefined;

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <ProfileForm
        availableBusinessTypes={[profile.businessType]}
        initialValues={initialValues}
        mode="edit"
        paypal={{
          email: profile.payoutEmail,
          linkedAt: profile.paypalLinkedAt.toISOString(),
        }}
        paypalStatus={typeof paypalStatus === "string" ? paypalStatus : undefined}
        profileId={profile.id}
        rejection={rejection}
      />
    </main>
  );
}
