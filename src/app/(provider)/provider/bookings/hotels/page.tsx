import { auth } from "@/lib/auth";
import { hotelBookingRepo } from "@/entities/hotel-booking";
import { providerProfileRepo } from "@/entities/provider-profile";
import {
  HOTEL_BOOKINGS_PAGE_SIZE,
  HotelBookingsTable,
  buildHotelBookingsUrl,
  hasActiveFilters,
  mapHotelBookingToListItem,
  parseHotelBookingsQuery,
  toHotelBookingFilter,
} from "@/features/provider/hotel-bookings";
import {
  TourBookingsStats,
  getTourBookingsSummary,
} from "@/features/provider/tour-bookings";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Đơn đặt phòng | Kênh Đối tác",
};

export default async function ProviderHotelBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const query = parseHotelBookingsQuery(await searchParams);

  const providerProfile =
    await providerProfileRepo.findApprovedByUserIdAndBusinessType(
      session.user.id,
      "hotel",
    );

  const [{ items: bookings, total }, hotelNames, statusRows] = providerProfile
    ? await Promise.all([
        hotelBookingRepo.findPageByProviderProfileId(
          providerProfile.id,
          toHotelBookingFilter(query),
          {
            skip: (query.page - 1) * HOTEL_BOOKINGS_PAGE_SIZE,
            take: HOTEL_BOOKINGS_PAGE_SIZE,
          },
        ),
        hotelBookingRepo.findHotelNames(providerProfile.id),
        hotelBookingRepo.summarizeByStatus(providerProfile.id),
      ])
    : [{ items: [], total: 0 }, [], []];

  const totalPages = Math.max(1, Math.ceil(total / HOTEL_BOOKINGS_PAGE_SIZE));
  if (query.page > totalPages) {
    redirect(buildHotelBookingsUrl(query, { page: totalPages }));
  }

  const items = bookings.map(mapHotelBookingToListItem);
  const summary = getTourBookingsSummary(statusRows);

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Đơn đặt phòng
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
            Theo dõi các đơn đặt phòng khách sạn của khách hàng, trạng thái
            thanh toán và doanh thu thực nhận.
          </p>
        </div>

        <TourBookingsStats
          summary={summary}
          totalHint="Toàn bộ đơn đặt phòng"
        />
        <HotelBookingsTable
          bookings={items}
          hasAnyBooking={summary.total > 0}
          hasFilters={hasActiveFilters(query)}
          hotelNames={hotelNames}
          page={query.page}
          pageSize={HOTEL_BOOKINGS_PAGE_SIZE}
          query={query}
          total={total}
        />
      </div>
    </main>
  );
}
