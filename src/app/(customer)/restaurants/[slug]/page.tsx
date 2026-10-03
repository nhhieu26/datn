import type { Metadata } from "next";
import { PageBanner } from "@/features/customer/components/page-banner";
import {
  RestaurantBookingCard,
  RestaurantContent,
  RestaurantDetailHeading,
  RestaurantFeatures,
} from "@/features/customer/restaurant-detail";
import { MOCK_RESTAURANT } from "@/features/customer/restaurant-detail/lib/restaurant-detail.mock";
import {
  TourComments,
  TourGallerySlider,
} from "@/features/customer/tour-detail";

// ponytail: UI-only, dùng dữ liệu mock cho mọi slug cho tới khi nối backend.
export const metadata: Metadata = {
  title: `${MOCK_RESTAURANT.name} — Roamly`,
};

export default function RestaurantDetailPage() {
  const restaurant = MOCK_RESTAURANT;

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
          <RestaurantFeatures restaurant={restaurant} />
        </div>
        <div className="mt-8">
          <TourGallerySlider images={restaurant.images} title={restaurant.name} />
        </div>
        <div className="page-x">
          <div className="mt-8 grid gap-8 lg:grid-cols-3 xl:grid-cols-[2fr_1fr]">
            <div className="lg:col-span-2 xl:col-span-1">
              <RestaurantContent restaurant={restaurant} />
              <div className="mt-8">
                <TourComments />
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
