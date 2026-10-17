import { auth } from "@/lib/auth";
import { providerProfileRepo } from "@/entities/provider-profile";
import { restaurantBookingRepo } from "@/entities/restaurant-booking";
import {
  RESTAURANT_BOOKINGS_PAGE_SIZE,
  RestaurantBookingsSummaryCards,
  RestaurantBookingsTable,
  buildRestaurantBookingsUrl,
  getRestaurantBookingsSummary,
  hasActiveFilters,
  mapRestaurantBookingToListItem,
  parseRestaurantBookingsQuery,
  toRestaurantBookingFilter,
} from "@/features/provider/restaurant-bookings";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Đơn đặt bàn | Kênh Đối tác",
};

export default async function ProviderRestaurantBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const query = parseRestaurantBookingsQuery(await searchParams);

  const providerProfile =
    await providerProfileRepo.findApprovedByUserIdAndBusinessType(
      session.user.id,
      "restaurant",
    );

  const [{ items: bookings, total }, restaurantNames, summaryData] =
    providerProfile
      ? await Promise.all([
          restaurantBookingRepo.findPageByProviderProfileId(
            providerProfile.id,
            toRestaurantBookingFilter(query),
            {
              skip: (query.page - 1) * RESTAURANT_BOOKINGS_PAGE_SIZE,
              take: RESTAURANT_BOOKINGS_PAGE_SIZE,
            },
          ),
          restaurantBookingRepo.findRestaurantNames(providerProfile.id),
          restaurantBookingRepo.summarizeByStatus(providerProfile.id),
        ])
      : [{ items: [], total: 0 }, [], { rows: [], upcoming: 0 }];

  const totalPages = Math.max(
    1,
    Math.ceil(total / RESTAURANT_BOOKINGS_PAGE_SIZE),
  );
  if (query.page > totalPages) {
    redirect(buildRestaurantBookingsUrl(query, { page: totalPages }));
  }

  const items = bookings.map(mapRestaurantBookingToListItem);
  const summary = getRestaurantBookingsSummary(summaryData);

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Đơn đặt bàn
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
            Theo dõi và xác nhận các đơn đặt bàn của khách hàng tại nhà hàng
            của bạn.
          </p>
        </div>

        <RestaurantBookingsSummaryCards summary={summary} />
        <RestaurantBookingsTable
          bookings={items}
          hasAnyBooking={summary.total > 0}
          hasFilters={hasActiveFilters(query)}
          page={query.page}
          pageSize={RESTAURANT_BOOKINGS_PAGE_SIZE}
          query={query}
          restaurantNames={restaurantNames}
          total={total}
        />
      </div>
    </main>
  );
}
