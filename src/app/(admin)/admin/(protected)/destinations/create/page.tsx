import { provinceRepo } from "@/entities/province";
import { tagRepo } from "@/entities/tag";
import { DestinationForm } from "@/features/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo địa điểm du lịch | Roamly Admin",
  description: "Tạo địa điểm du lịch mới trên Roamly.",
};

export default async function CreateDestinationPage() {
  const [provinces, tags] = await Promise.all([
    provinceRepo.findAll(),
    tagRepo.findAll(),
  ]);

  return (
    <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
      <DestinationForm provinces={provinces} tags={tags} />
    </main>
  );
}
