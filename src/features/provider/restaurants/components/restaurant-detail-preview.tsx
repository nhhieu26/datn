"use client";

import { PageBanner } from "@/features/customer/components/page-banner";
import {
  RestaurantBookingCard,
  RestaurantContent,
  RestaurantDetailHeading,
} from "@/features/customer/restaurant-detail";
import type { RestaurantDetail } from "@/features/customer/restaurant-detail/lib/restaurant-detail";
import { TourGallerySlider } from "@/features/customer/tour-detail";
import type { RestaurantFormState } from "./restaurant-form";

const FALLBACK = [{ url: "/image-notfound.png" }];

// Dựng RestaurantDetail từ state form, mapping giống toRestaurantDetail bên customer
function toPreviewDetail(
  form: RestaurantFormState,
  provinceName: string | undefined,
  tagNames: string[]
): RestaurantDetail {
  return {
    id: "preview",
    slug: "preview",
    name: form.name || "Tên nhà hàng của bạn",
    location: provinceName || "Chưa chọn địa điểm",
    address: form.address,
    phone: form.phone || null,
    latitude: form.location?.lat ?? null,
    longitude: form.location?.lng ?? null,
    description: form.description,
    capacity: Number(form.capacity) || 0,
    images: form.photos.length
      ? form.photos.map((photo) => ({ url: photo.previewUrl }))
      : FALLBACK,
    menu: form.menu
      .filter((item) => item.name.trim())
      .map((item) => ({
        name: item.name,
        description: item.description,
        price: Number(item.price) || 0,
      })),
    tags: tagNames,
    timeSlots: form.timeSlots,
    rating: { avg: 0, count: 0 },
  };
}

export function RestaurantDetailPreview({
  form,
  provinceName,
  tagNames,
}: {
  form: RestaurantFormState;
  provinceName?: string;
  tagNames: string[];
}) {
  const restaurant = toPreviewDetail(form, provinceName, tagNames);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-card-line bg-card shadow-2xs">
      <div className="flex items-center gap-x-3 border-b border-card-divider bg-surface px-4 py-2.5">
        <div className="flex gap-x-1.5">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-yellow-400" />
          <span className="size-2.5 rounded-full bg-teal-400" />
        </div>
        <div className="flex-1 truncate rounded-lg border border-layer-line bg-layer px-3 py-1 text-xs text-muted-foreground-1">
          roamly.vn/restaurants/…
        </div>
        <span className="inline-flex items-center gap-x-1.5 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-800">
          <span className="size-1.5 rounded-full bg-teal-500" />
          Xem trước
        </span>
      </div>

      {/* Chặn link để không rời form và mất dữ liệu đang nhập */}
      <div className="bg-white font-sans text-gray-900 antialiased [&_a]:pointer-events-none">
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
            <TourGallerySlider
              images={restaurant.images}
              title={restaurant.name}
            />
          </div>
          <div className="page-x">
            <div className="mt-8 grid gap-8 lg:grid-cols-3 xl:grid-cols-[2fr_1fr]">
              <div className="lg:col-span-2 xl:col-span-1">
                <RestaurantContent restaurant={restaurant} />
              </div>
              <aside>
                <RestaurantBookingCard restaurant={restaurant} />
              </aside>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
