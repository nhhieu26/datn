import { auth } from "@/lib/auth";
import { providerProfileRepo } from "@/entities/provider-profile";
import { provinceRepo } from "@/entities/province";
import { tagRepo } from "@/entities/tag";
import { tourRepo } from "@/entities/tour";
import { TourForm, mapTourToFormValues } from "@/features/provider/tours";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Chỉnh sửa Tour | Kênh Đối tác",
};

export default async function EditTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  if (session.user.role !== "provider") redirect("/provider/profiles");

  const providerProfile =
    await providerProfileRepo.findApprovedByUserIdAndBusinessType(
      session.user.id,
      "tour",
    );
  if (!providerProfile) notFound();

  const [tour, provinces, tags] = await Promise.all([
    tourRepo.findByIdForProvider(id, providerProfile.id),
    provinceRepo.findAll(),
    tagRepo.findAll(),
  ]);
  if (!tour) notFound();

  return (
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <TourForm
        initialValues={mapTourToFormValues(tour)}
        mode="edit"
        provinces={provinces}
        tags={tags}
        tourId={tour.id}
      />
    </main>
  );
}
