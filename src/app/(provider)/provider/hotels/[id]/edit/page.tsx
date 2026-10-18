import { auth } from "@/lib/auth";
import { providerProfileRepo } from "@/entities/provider-profile";
import { provinceRepo } from "@/entities/province";
import { tagRepo } from "@/entities/tag";
import { hotelRepo } from "@/entities/hotel";
import { HotelForm, mapHotelToFormValues } from "@/features/provider/hotels";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Chỉnh sửa Khách sạn | Kênh Đối tác",
};

export default async function EditHotelPage({
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
      "hotel",
    );
  if (!providerProfile) notFound();

  const [hotel, provinces, tags] = await Promise.all([
    hotelRepo.findByIdForProvider(id, providerProfile.id),
    provinceRepo.findAll(),
    tagRepo.findAll(),
  ]);
  if (!hotel) notFound();
  // Khách sạn đã dừng chờ xóa thì không cho sửa
  if (hotel.deleteScheduledAt) redirect("/provider/hotels");

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <HotelForm
        initialValues={mapHotelToFormValues(hotel)}
        mode="edit"
        provinces={provinces}
        tags={tags}
        hotelId={hotel.id}
      />
    </main>
  );
}
