import { auth } from "@/lib/auth";
import { providerProfileRepo } from "@/entities/provider-profile";
import { provinceRepo } from "@/entities/province";
import { tagRepo } from "@/entities/tag";
import { restaurantRepo } from "@/entities/restaurant";
import {
  RestaurantForm,
  mapRestaurantToFormValues,
} from "@/features/provider/restaurants";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Chỉnh sửa Nhà hàng | Kênh Đối tác",
};

export default async function EditRestaurantPage({
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
      "restaurant",
    );
  if (!providerProfile) notFound();

  const [restaurant, provinces, tags] = await Promise.all([
    restaurantRepo.findByIdForProvider(id, providerProfile.id),
    provinceRepo.findAll(),
    tagRepo.findAll(),
  ]);
  if (!restaurant) notFound();
  // Nhà hàng đã dừng chờ xóa thì không cho sửa
  if (restaurant.deleteScheduledAt) redirect("/provider/restaurants");

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <RestaurantForm
        initialValues={mapRestaurantToFormValues(restaurant)}
        mode="edit"
        provinces={provinces}
        tags={tags}
        restaurantId={restaurant.id}
      />
    </main>
  );
}
