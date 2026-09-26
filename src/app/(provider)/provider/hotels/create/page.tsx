import { auth } from "@/lib/auth";
import { provinceRepo } from "@/entities/province";
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

  const provinces = await provinceRepo.findAll();

  return (
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <HotelForm provinces={provinces} />
    </main>
  );
}
