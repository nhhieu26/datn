import { hotelBookingRepo } from "@/entities/hotel-booking";
import {
  buildMyBookingsUrl,
  getMyBookingsSummary,
  getTabStatuses,
  mapToMyHotelBookingItem,
  MY_BOOKINGS_PAGE_SIZE,
  MyBookingsSummaryCards,
  MyBookingsTabs,
  MyHotelBookingsList,
  parseMyBookingsQuery,
} from "@/features/customer/my-bookings";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Đơn đặt phòng của tôi",
};

export default async function MyHotelBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const query = parseMyBookingsQuery(await searchParams);

  await hotelBookingRepo.releaseExpired();
  const [{ items: bookings, total }, statusRows] = await Promise.all([
    hotelBookingRepo.findPageByCustomerId(
      session.user.id,
      getTabStatuses(query.tab),
      {
        skip: (query.page - 1) * MY_BOOKINGS_PAGE_SIZE,
        take: MY_BOOKINGS_PAGE_SIZE,
      },
    ),
    hotelBookingRepo.summarizeByCustomerId(session.user.id),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / MY_BOOKINGS_PAGE_SIZE));
  if (query.page > totalPages) {
    redirect(buildMyBookingsUrl(query, { page: totalPages }));
  }

  const summary = getMyBookingsSummary(statusRows);

  return (
    <div className="rounded-md bg-new-section-bg p-6">
      <h1 className="mb-6 text-2xl font-semibold text-new-title">Đơn đặt phòng</h1>
      <MyBookingsSummaryCards summary={summary} />
      <div className="rounded-md bg-white p-6">
        <MyBookingsTabs query={query} />
        <MyHotelBookingsList
          items={bookings.map(mapToMyHotelBookingItem)}
          total={total}
          query={query}
          hasAnyBooking={summary.total > 0}
        />
      </div>
    </div>
  );
}
