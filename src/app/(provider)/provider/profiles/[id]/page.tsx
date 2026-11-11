import { providerProfileRepo } from "@/entities/provider-profile";
import { auth } from "@/lib/auth";
import { ProfileDetail } from "@/features/provider/profiles";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Chi tiết Hồ sơ Doanh nghiệp | Kênh Đối tác",
};

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const result = await providerProfileRepo.findDetailById(id, session.user.id);
  if (!result) notFound();

  const { _count, ...profile } = result;
  const serviceCount = {
    tour: _count.tours,
    hotel: _count.hotels,
    restaurant: _count.restaurants,
  }[profile.businessType];

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <ProfileDetail profile={profile} serviceCount={serviceCount} />
    </main>
  );
}
