"use client";

import { PageBanner } from "@/features/customer/components/page-banner";
import {
  HotelBookingCard,
  HotelContent,
  HotelDetailHeading,
} from "@/features/customer/hotel-detail";
import type { HotelDetail } from "@/features/customer/hotel-detail/lib/to-hotel-detail";
import { TourGallerySlider } from "@/features/customer/tour-detail";
import type { HotelFormState } from "./hotel-form";

const FALLBACK = [{ url: "/image-notfound.png" }];

// Dựng HotelDetail từ state form, mapping giống toHotelDetail bên customer
function toPreviewDetail(
  form: HotelFormState,
  provinceName: string | undefined,
  tagNames: string[]
): HotelDetail {
  const rooms = form.rooms.map((room, index) => ({
    id: room.id ?? `draft-${index}`,
    name: room.name || `Loại phòng ${index + 1}`,
    description: room.description,
    images: room.photos.length
      ? room.photos.map((photo) => ({ url: photo.previewUrl }))
      : FALLBACK,
    capacity: Number(room.capacity) || 0,
    quantity: Number(room.quantity) || 0,
    basePrice: Number(room.basePrice) || 0,
    amenities: room.amenities,
  }));

  return {
    id: "preview",
    slug: "preview",
    name: form.name || "Tên khách sạn của bạn",
    location: provinceName || "Chưa chọn địa điểm",
    address: form.address,
    description: form.description,
    images: form.photos.length
      ? form.photos.map((photo) => ({ url: photo.previewUrl }))
      : FALLBACK,
    amenities: form.amenities,
    tags: tagNames,
    latitude: form.location?.lat ?? null,
    longitude: form.location?.lng ?? null,
    minPrice: rooms.length ? Math.min(...rooms.map((r) => r.basePrice)) : 0,
    maxCapacity: Math.max(0, ...rooms.map((r) => r.capacity)),
    rooms,
    rating: { avg: 0, count: 0 },
  };
}

export function HotelDetailPreview({
  form,
  provinceName,
  tagNames,
}: {
  form: HotelFormState;
  provinceName?: string;
  tagNames: string[];
}) {
  const hotel = toPreviewDetail(form, provinceName, tagNames);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-card-line bg-card shadow-2xs">
      <div className="flex items-center gap-x-3 border-b border-card-divider bg-surface px-4 py-2.5">
        <div className="flex gap-x-1.5">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-yellow-400" />
          <span className="size-2.5 rounded-full bg-teal-400" />
        </div>
        <div className="flex-1 truncate rounded-lg border border-layer-line bg-layer px-3 py-1 text-xs text-muted-foreground-1">
          roamly.vn/hotels/…
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
              </div>
              <aside>
                <HotelBookingCard hotel={hotel} />
              </aside>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
