import { hotelBookingRepo } from "@/entities/hotel-booking";
import { providerProfileRepo } from "@/entities/provider-profile";
import {
  HotelBookingCustomer,
  HotelBookingDetailHeader,
  HotelBookingFinancial,
  HotelBookingNotes,
  HotelBookingRoomCard,
  HotelBookingTimeline,
  PrelineCard,
  mapHotelBookingToDetail,
} from "@/features/provider/hotel-bookings";
import { BookingIcon } from "@/features/provider/tour-bookings/components/booking-icon";
import {
  PrelinePaymentBadge,
  PrelineStatusBadge,
} from "@/features/provider/tour-bookings/components/tour-booking-status";
import { auth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Chi tiết đơn đặt phòng | Kênh Đối tác",
};

export default async function ProviderHotelBookingDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { code } = await params;
  const providerProfile =
    await providerProfileRepo.findApprovedByUserIdAndBusinessType(
      session.user.id,
      "hotel",
    );
  if (!providerProfile) notFound();

  await hotelBookingRepo.releaseExpired();
  const record = await hotelBookingRepo.findByCodeForProvider(
    decodeURIComponent(code),
    providerProfile.id,
  );
  if (!record) notFound();

  const booking = mapHotelBookingToDetail(record);
  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        <div className="space-y-3">
          <ol className="flex items-center whitespace-nowrap">
            <li className="inline-flex items-center">
              <Link
                className="flex items-center text-sm text-muted-foreground-1 hover:text-primary-focus focus:text-primary-focus focus:outline-hidden"
                href="/provider/bookings/hotels"
              >
                Đơn đặt phòng
              </Link>
              <BookingIcon
                name="chevronRight"
                className="mx-2 size-4 text-muted-foreground-1"
              />
            </li>
            <li
              aria-current="page"
              className="inline-flex items-center truncate text-sm font-semibold text-foreground"
            >
              {booking.code}
            </li>
          </ol>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-foreground">
                  Đơn {booking.code}
                </h1>
                <PrelineStatusBadge status={booking.status} />
                <PrelinePaymentBadge state={booking.paymentState} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground-1">
                Tạo lúc {formatDateTime(booking.createdAt)}
              </p>
            </div>
            <Link
              className="inline-flex w-fit items-center gap-x-2 rounded-lg border border-layer-line bg-layer px-3 py-2 text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden"
              href="/provider/bookings/hotels"
            >
              <BookingIcon name="arrowLeft" />
              Quay lại danh sách
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_340px]">
          <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
            <PrelineCard icon="receipt" title="Thông tin đặt phòng">
              <HotelBookingDetailHeader booking={booking} />
            </PrelineCard>
            <PrelineCard icon="bed" title="Chi tiết phòng">
              <HotelBookingRoomCard booking={booking} />
            </PrelineCard>
            <PrelineCard icon="wallet" title="Tổng quan tài chính">
              <HotelBookingFinancial booking={booking} />
            </PrelineCard>
          </div>

          <div className="flex flex-col gap-4 sm:gap-6">
            <PrelineCard icon="user" title="Thông tin khách hàng">
              <HotelBookingCustomer booking={booking} />
            </PrelineCard>
            <HotelBookingNotes booking={booking} />
            <PrelineCard icon="clock" title="Tiến trình đơn">
              <HotelBookingTimeline booking={booking} />
            </PrelineCard>
          </div>
        </div>
      </div>
    </main>
  );
}
