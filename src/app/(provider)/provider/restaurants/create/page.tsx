import { auth } from "@/lib/auth";
import { provinceRepo } from "@/entities/province";
import { tagRepo } from "@/entities/tag";
import { RestaurantForm } from "@/features/provider/restaurants";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Tạo Nhà Hàng Mới | Kênh Đối tác",
};

export default async function CreateRestaurantPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  if (session.user.role !== "provider") redirect("/provider/profiles");

  const [provinces, tags] = await Promise.all([
    provinceRepo.findAll(),
    tagRepo.findAll(),
  ]);

  return (
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <RestaurantForm provinces={provinces} tags={tags} />
    </main>
  );
}
