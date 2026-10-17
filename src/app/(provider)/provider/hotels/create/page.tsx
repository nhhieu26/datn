import { auth } from "@/lib/auth";
import { provinceRepo } from "@/entities/province";
import { tagRepo } from "@/entities/tag";
import { HotelForm } from "@/features/provider/hotels";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Tạo Khách Sạn Mới | Kênh Đối tác",
};

export default async function CreateHotelPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  if (session.user.role !== "provider") redirect("/provider/profiles");

  const [provinces, tags] = await Promise.all([
    provinceRepo.findAll(),
    tagRepo.findAll(),
  ]);

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <HotelForm provinces={provinces} tags={tags} />
    </main>
  );
}
