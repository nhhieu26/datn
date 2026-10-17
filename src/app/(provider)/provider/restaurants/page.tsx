import { auth } from "@/lib/auth";
import { restaurantRepo } from "@/entities/restaurant";
import { providerProfileRepo } from "@/entities/provider-profile";
import {
  RestaurantIcon,
  RestaurantsManager,
  RestaurantsSummaryCards,
  getRestaurantsSummary,
  mapRestaurantToListItem,
} from "@/features/provider/restaurants";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Quản lý Nhà hàng | Kênh Đối tác",
};

export default async function ProviderRestaurantsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const providerProfile =
    await providerProfileRepo.findApprovedByUserIdAndBusinessType(
      session.user.id,
      "restaurant"
    );

  const restaurants = providerProfile
    ? await restaurantRepo.findAllByProviderProfileId(providerProfile.id)
    : [];
  const restaurantListItems = restaurants.map(mapRestaurantToListItem);

  const summary = getRestaurantsSummary(restaurantListItems);

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        <div className="grid gap-3 md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Quản lý Nhà hàng &amp; Ẩm thực
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
              Quản lý, theo dõi trạng thái hoạt động, thực đơn và khung giờ phục
              vụ của các nhà hàng trên Roamly.
            </p>
          </div>
          <Link
            className="inline-flex shrink-0 items-center gap-x-2 self-start rounded-lg border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden md:self-auto"
            href="/provider/restaurants/create"
          >
            <RestaurantIcon name="plus" />
            Tạo Nhà hàng mới
          </Link>
        </div>

        <RestaurantsSummaryCards summary={summary} />

        <RestaurantsManager restaurants={restaurantListItems} />
      </div>
    </main>
  );
}
