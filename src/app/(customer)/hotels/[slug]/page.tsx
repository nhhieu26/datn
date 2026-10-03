import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hotelRepo } from "@/entities/hotel";
import { PageBanner } from "@/features/customer/components/page-banner";
import {
  HotelBookingCard,
  HotelContent,
  HotelDetailHeading,
} from "@/features/customer/hotel-detail";
import { toHotelDetail } from "@/features/customer/hotel-detail/lib/to-hotel-detail";
import {
  TourComments,
  TourGallerySlider,
} from "@/features/customer/tour-detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await hotelRepo.findPublishedDetailBySlug(slug);
  return {
    title: hotel ? `${hotel.name} — Roamly` : "Không tìm thấy khách sạn",
  };
}

export default async function HotelDetailPage({ params }: Props) {
  const { slug } = await params;
  const row = await hotelRepo.findPublishedDetailBySlug(slug);
  if (!row) notFound();
  const hotel = toHotelDetail(row);

  return (
    <main>
      <PageBanner
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Khám phá", href: "/explore?kind=hotel" },
          { label: "Chi tiết khách sạn" },
        ]}
        title="Chi tiết khách sạn"
      />
      <section className="py-12">
        <div className="page-x">
          <HotelDetailHeading hotel={hotel} />
        </div>
        <div className="mt-8">
          <TourGallerySlider images={hotel.images} title={hotel.name} />
        </div>
        <div className="page-x">
          <div className="mt-8 grid gap-8 lg:grid-cols-3 xl:grid-cols-[2fr_1fr]">
            <div className="lg:col-span-2 xl:col-span-1">
              <HotelContent hotel={hotel} />
              <div className="mt-8">
                <TourComments />
              </div>
            </div>
            <aside>
              <HotelBookingCard hotel={hotel} />
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
