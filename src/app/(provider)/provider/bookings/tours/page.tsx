import { auth } from "@/lib/auth";
import { tourBookingRepo } from "@/entities/tour-booking";
import { providerProfileRepo } from "@/entities/provider-profile";
import {
  TOUR_BOOKINGS_PAGE_SIZE,
  TourBookingsSummaryCards,
  TourBookingsTable,
  getTourBookingsSummary,
  buildTourBookingsUrl,
  hasActiveFilters,
  mapTourBookingToListItem,
  parseTourBookingsQuery,
  toTourBookingFilter,
} from "@/features/provider/tour-bookings";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Đơn đặt tour | Kênh Đối tác",
};

export default async function ProviderTourBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const query = parseTourBookingsQuery(await searchParams);

  const providerProfile =
    await providerProfileRepo.findApprovedByUserIdAndBusinessType(
      session.user.id,
      "tour",
    );

  const [{ items: bookings, total }, tourTitles, statusRows] = providerProfile
    ? await Promise.all([
        tourBookingRepo.findPageByProviderProfileId(
          providerProfile.id,
          toTourBookingFilter(query),
          {
            skip: (query.page - 1) * TOUR_BOOKINGS_PAGE_SIZE,
            take: TOUR_BOOKINGS_PAGE_SIZE,
          },
        ),
        tourBookingRepo.findTourTitles(providerProfile.id),
        tourBookingRepo.summarizeByStatus(providerProfile.id),
      ])
    : [{ items: [], total: 0 }, [], []];

  const totalPages = Math.max(1, Math.ceil(total / TOUR_BOOKINGS_PAGE_SIZE));
  if (query.page > totalPages) {
    redirect(buildTourBookingsUrl(query, { page: totalPages }));
  }

  const items = bookings.map(mapTourBookingToListItem);
  const summary = getTourBookingsSummary(statusRows);

  return (
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <div className="mx-auto flex w-full max-w-7xl flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">
            Đơn đặt tour
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
            Theo dõi các đơn đặt tour của khách hàng, trạng thái thanh toán và
            doanh thu thực nhận.
          </p>
        </div>

        <TourBookingsSummaryCards summary={summary} />
        <TourBookingsTable
          bookings={items}
          hasAnyBooking={summary.total > 0}
          hasFilters={hasActiveFilters(query)}
          page={query.page}
          pageSize={TOUR_BOOKINGS_PAGE_SIZE}
          query={query}
          total={total}
          tourTitles={tourTitles}
        />
      </div>
    </main>
  );
}
