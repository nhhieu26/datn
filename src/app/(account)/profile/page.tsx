import { tagRepo } from "@/entities/tag";
import { userRepo } from "@/entities/user";
import { ProfileDashboard } from "@/features/customer/account";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Hồ sơ của tôi",
};

export default async function CustomerProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [user, tags] = await Promise.all([
    userRepo.findProfileById(session.user.id),
    tagRepo.findAll(),
  ]);
  if (!user) redirect("/sign-in");

  return <ProfileDashboard user={user} tags={tags} />;
}
