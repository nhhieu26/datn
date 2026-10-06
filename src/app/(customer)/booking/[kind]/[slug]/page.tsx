import { hotelRepo } from "@/entities/hotel";
import { hotelBookingRepo } from "@/entities/hotel-booking";
import { restaurantRepo } from "@/entities/restaurant";
import { tourRepo } from "@/entities/tour";
import { tourBookingRepo } from "@/entities/tour-booking";
import { userRepo } from "@/entities/user";
import {
  BookingFlow,
  hotelSummary,
  restaurantSummary,
  tourSummary,
  type BookingQuery,
  type BookingSummary,
} from "@/features/customer/booking";
import { toHotelDetail } from "@/features/customer/hotel-detail/lib/to-hotel-detail";
import { toRestaurantDetail } from "@/features/customer/restaurant-detail/lib/to-restaurant-detail";
import { USD_RATE } from "@/features/customer/booking/lib/exchange-rate";
import { toTourDetail } from "@/features/customer/tour-detail/lib/to-tour-detail";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = { title: "Đặt chỗ — Roamly" };

type Props = {
  params: Promise<{ kind: string; slug: string }>;
  searchParams: Promise<BookingQuery>;
};

async function loadSummary(
  kind: string,
  slug: string,
  query: BookingQuery,
): Promise<{ summary: BookingSummary | null; backHref: string }> {
  switch (kind) {
    case "tour": {
      await tourBookingRepo.releaseExpired();
      const row = await tourRepo.findPublishedDetailBySlug(slug);
      if (!row) notFound();
      return {
        summary: tourSummary(toTourDetail(row), query),
        backHref: `/tours/${slug}`,
      };
    }
    case "hotel": {
      await hotelBookingRepo.releaseExpired();
      const row = await hotelRepo.findPublishedDetailBySlug(slug);
      if (!row) notFound();
      return {
        summary: hotelSummary(toHotelDetail(row), query),
        backHref: `/hotels/${slug}`,
      };
    }
    case "restaurant": {
      const row = await restaurantRepo.findPublishedDetailBySlug(slug);
      if (!row) notFound();
      return {
        summary: restaurantSummary(toRestaurantDetail(row), query),
        backHref: `/restaurants/${slug}`,
      };
    }
    default:
      notFound();
  }
}

export default async function BookingPage({ params, searchParams }: Props) {
  const { kind, slug } = await params;
  const query = await searchParams;

  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const { summary, backHref } = await loadSummary(kind, slug, query);
  // Lựa chọn trên query thiếu/không hợp lệ → quay lại trang chi tiết để chọn lại
  if (!summary) redirect(backHref);

  const user = await userRepo.findProfileById(session.user.id);

  return (
    <main>
      <BookingFlow
        initialContact={{
          contactName: user?.fullname ?? "",
          contactEmail: user?.email ?? "",
          contactPhone: user?.phone ?? "",
          note: "",
        }}
        summary={summary}
        usdRate={USD_RATE}
      />
    </main>
  );
}
