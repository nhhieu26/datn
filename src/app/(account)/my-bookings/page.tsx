import { tourBookingRepo } from "@/entities/tour-booking";
import {
  buildMyBookingsUrl,
  getMyBookingsSummary,
  getTabStatuses,
  mapToMyBookingItem,
  MY_BOOKINGS_PAGE_SIZE,
  MyBookingsList,
  MyBookingsSummaryCards,
  MyBookingsTabs,
  parseMyBookingsQuery,
} from "@/features/customer/my-bookings";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Đơn đặt chỗ của tôi",
};

export default async function MyBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const query = parseMyBookingsQuery(await searchParams);

  await tourBookingRepo.releaseExpired();
  const [{ items: bookings, total }, statusRows] = await Promise.all([
    tourBookingRepo.findPageByCustomerId(
      session.user.id,
      getTabStatuses(query.tab),
      {
        skip: (query.page - 1) * MY_BOOKINGS_PAGE_SIZE,
        take: MY_BOOKINGS_PAGE_SIZE,
      },
    ),
    tourBookingRepo.summarizeByCustomerId(session.user.id),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / MY_BOOKINGS_PAGE_SIZE));
  if (query.page > totalPages) {
    redirect(buildMyBookingsUrl(query, { page: totalPages }));
  }

  const summary = getMyBookingsSummary(statusRows);

  return (
    <div className="rounded-md bg-new-section-bg p-6">
      <h1 className="mb-6 text-2xl font-semibold text-new-title">Đơn đặt tour</h1>
      <MyBookingsSummaryCards summary={summary} />
      <div className="rounded-md bg-white p-6">
        <MyBookingsTabs query={query} />
        <MyBookingsList
          items={bookings.map(mapToMyBookingItem)}
          total={total}
          query={query}
          hasAnyBooking={summary.total > 0}
        />
      </div>
    </div>
  );
}
