import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { restaurantRepo } from "@/entities/restaurant";
import { FadeIn } from "@/features/customer/components/motion";
import { PageBanner } from "@/features/customer/components/page-banner";
import {
  RestaurantBookingCard,
  RestaurantContent,
  RestaurantDetailHeading,
} from "@/features/customer/restaurant-detail";
import { toRestaurantDetail } from "@/features/customer/restaurant-detail/lib/to-restaurant-detail";
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
  const row = await restaurantRepo.findPublishedDetailBySlug(slug);
  return {
    title: row ? `${row.name} — Roamly` : "Không tìm thấy nhà hàng",
  };
}

export default async function RestaurantDetailPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const reviewsTake = parseReviewsTake((await searchParams).reviews);
  const row = await restaurantRepo.findPublishedDetailBySlug(slug);
  if (!row) notFound();
  const restaurant = toRestaurantDetail(row);

  return (
    <main>
      <PageBanner
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Khám phá", href: "/explore?kind=restaurant" },
          { label: "Chi tiết nhà hàng" },
        ]}
        title="Chi tiết nhà hàng"
      />
      <section className="py-12">
        <div className="page-x">
          <FadeIn duration={0.48} inView={false} y={14}>
            <RestaurantDetailHeading restaurant={restaurant} />
          </FadeIn>
        </div>
        <FadeIn className="mt-8" delay={0.08} duration={0.52} inView={false} y={14}>
          <TourGallerySlider images={restaurant.images} title={restaurant.name} />
        </FadeIn>
        <div className="page-x">
          <div className="mt-8 grid gap-8 lg:grid-cols-3 xl:grid-cols-[2fr_1fr]">
            <div className="lg:col-span-2 xl:col-span-1">
              <FadeIn delay={0.12} y={16}>
                <RestaurantContent restaurant={restaurant} />
              </FadeIn>
              <FadeIn className="mt-8" y={18}>
                <ServiceReviews
                  kind="restaurant"
                  serviceId={restaurant.id}
                  slug={restaurant.slug}
                  take={reviewsTake}
                  total={restaurant.rating.count}
                />
              </FadeIn>
            </div>
            <FadeIn delay={0.16} duration={0.55} inView={false} x={18} y={12}>
              <aside>
                <RestaurantBookingCard restaurant={restaurant} />
              </aside>
            </FadeIn>
          </div>
        </div>
      </section>
    </main>
  );
}
