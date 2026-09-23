import { auth } from "@/lib/auth";
import { provinceRepo } from "@/entities/province";
import { tagRepo } from "@/entities/tag";
import { TourForm } from "@/features/provider/tours";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Tạo Tour Mới | Kênh Đối tác",
};

export default async function CreateTourPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  if (session.user.role !== "provider") redirect("/provider/profiles");

  const [provinces, tags] = await Promise.all([
    provinceRepo.findAll(),
    tagRepo.findAll(),
  ]);

  return (
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <TourForm provinces={provinces} tags={tags} />
    </main>
  );
}
