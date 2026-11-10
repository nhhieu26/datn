import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hotelRepo } from "@/entities/hotel";
import { FadeIn } from "@/features/customer/components/motion";
import { PageBanner } from "@/features/customer/components/page-banner";
import {
  HotelBookingCard,
  HotelContent,
  HotelDetailHeading,
} from "@/features/customer/hotel-detail";
import { toHotelDetail } from "@/features/customer/hotel-detail/lib/to-hotel-detail";
import {
  parseReviewsTake,
  ServiceReviews,
} from "@/features/customer/reviews";
import { TourGallerySlider } from "@/features/customer/tour-detail";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await hotelRepo.findPublishedDetailBySlug(slug);
  return {
    title: hotel ? `${hotel.name} — Roamly` : "Không tìm thấy khách sạn",
  };
}

export default async function HotelDetailPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const reviewsTake = parseReviewsTake((await searchParams).reviews);
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
          <FadeIn duration={0.48} inView={false} y={14}>
            <HotelDetailHeading hotel={hotel} />
          </FadeIn>
        </div>
        <FadeIn className="mt-8" delay={0.08} duration={0.52} inView={false} y={14}>
          <TourGallerySlider images={hotel.images} title={hotel.name} />
        </FadeIn>
        <div className="page-x">
          <div className="mt-8 grid gap-8 lg:grid-cols-3 xl:grid-cols-[2fr_1fr]">
            <div className="lg:col-span-2 xl:col-span-1">
              <FadeIn delay={0.12} y={16}>
                <HotelContent hotel={hotel} />
              </FadeIn>
              <FadeIn className="mt-8" y={18}>
                <ServiceReviews
                  kind="hotel"
                  serviceId={hotel.id}
                  slug={hotel.slug}
                  take={reviewsTake}
                  total={hotel.rating.count}
                />
              </FadeIn>
            </div>
            <FadeIn delay={0.16} duration={0.55} inView={false} x={18} y={12}>
              <aside>
                <HotelBookingCard hotel={hotel} />
              </aside>
            </FadeIn>
          </div>
        </div>
      </section>
    </main>
  );
}
