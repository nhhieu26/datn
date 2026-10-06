import { restaurantBookingRepo } from "@/entities/restaurant-booking";
import {
  buildMyBookingsUrl,
  getMyRestaurantBookingsSummary,
  getTabStatuses,
  mapToMyRestaurantBookingItem,
  MY_BOOKINGS_PAGE_SIZE,
  MY_RESTAURANT_BOOKINGS_TABS,
  MyBookingsTabs,
  MyRestaurantBookingsList,
  MyRestaurantBookingsSummaryCards,
  parseMyBookingsQuery,
} from "@/features/customer/my-bookings";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Đơn đặt bàn của tôi",
};

export default async function MyRestaurantBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const query = parseMyBookingsQuery(await searchParams, MY_RESTAURANT_BOOKINGS_TABS);

  const [{ items: bookings, total }, statusSummary] = await Promise.all([
    restaurantBookingRepo.findPageByCustomerId(
      session.user.id,
      getTabStatuses(query.tab),
      {
        skip: (query.page - 1) * MY_BOOKINGS_PAGE_SIZE,
        take: MY_BOOKINGS_PAGE_SIZE,
      },
    ),
    restaurantBookingRepo.summarizeByCustomerId(session.user.id),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / MY_BOOKINGS_PAGE_SIZE));
  if (query.page > totalPages) {
    redirect(buildMyBookingsUrl(query, { page: totalPages }));
  }

  const summary = getMyRestaurantBookingsSummary(statusSummary);

  return (
    <div className="rounded-md bg-new-section-bg p-6">
      <h1 className="mb-6 text-2xl font-semibold text-new-title">Đơn đặt bàn</h1>
      <MyRestaurantBookingsSummaryCards summary={summary} />
      <div className="rounded-md bg-white p-6">
        <MyBookingsTabs query={query} tabs={MY_RESTAURANT_BOOKINGS_TABS} />
        <MyRestaurantBookingsList
          items={bookings.map(mapToMyRestaurantBookingItem)}
          total={total}
          query={query}
          hasAnyBooking={summary.total > 0}
        />
      </div>
    </div>
  );
}
