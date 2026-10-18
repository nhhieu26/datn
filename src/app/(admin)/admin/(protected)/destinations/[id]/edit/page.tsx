import { destinationRepo } from "@/entities/destination";
import { provinceRepo } from "@/entities/province";
import { tagRepo } from "@/entities/tag";
import {
  DestinationForm,
  mapDestinationToFormValues,
} from "@/features/admin/destinations";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Chỉnh sửa địa điểm | Roamly Admin",
  description: "Chỉnh sửa địa điểm du lịch trên Roamly.",
};

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [destination, provinces, tags] = await Promise.all([
    destinationRepo.findById(id),
    provinceRepo.findAll(),
    tagRepo.findAll(),
  ]);
  if (!destination) notFound();

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <DestinationForm
        destinationId={destination.id}
        initialValues={mapDestinationToFormValues(destination)}
        mode="edit"
        provinces={provinces}
        tags={tags}
      />
    </main>
  );
}
