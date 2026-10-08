import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { restaurantRepo } from "@/entities/restaurant";
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
          <RestaurantDetailHeading restaurant={restaurant} />
        </div>
        <div className="mt-8">
          <TourGallerySlider images={restaurant.images} title={restaurant.name} />
        </div>
        <div className="page-x">
          <div className="mt-8 grid gap-8 lg:grid-cols-3 xl:grid-cols-[2fr_1fr]">
            <div className="lg:col-span-2 xl:col-span-1">
              <RestaurantContent restaurant={restaurant} />
              <div className="mt-8">
                <ServiceReviews
                  kind="restaurant"
                  serviceId={restaurant.id}
                  slug={restaurant.slug}
                  take={reviewsTake}
                  total={restaurant.rating.count}
                />
              </div>
            </div>
            <aside>
              <RestaurantBookingCard restaurant={restaurant} />
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
