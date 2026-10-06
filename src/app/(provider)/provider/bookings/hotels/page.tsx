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
  TourBookingsSummaryCards,
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
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <div className="mx-auto flex w-full max-w-7xl flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">
            Đơn đặt phòng
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
            Theo dõi các đơn đặt phòng khách sạn của khách hàng, trạng thái
            thanh toán và doanh thu thực nhận.
          </p>
        </div>

        <TourBookingsSummaryCards summary={summary} />
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
