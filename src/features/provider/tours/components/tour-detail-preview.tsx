"use client";

import { PageBanner } from "@/features/customer/components/page-banner";
import {
  TourBookingCard,
  TourContent,
  TourDetailHeading,
  TourGallerySlider,
} from "@/features/customer/tour-detail";
import type { TourDetail } from "@/features/customer/tour-detail/lib/to-tour-detail";
import type { TourFormState } from "./tour-form";

// Dựng TourDetail từ state form, mapping giống toTourDetail bên customer
function toPreviewDetail(
  form: TourFormState,
  provinceName: string | undefined,
  tagNames: string[]
): TourDetail {
  const basePrice = Number(form.basePrice) || 0;
  const departures = form.departures
    .filter((row) => row.departureDate)
    .map((row, index) => ({
      id: row.id ?? `draft-${index}`,
      date: row.departureDate,
      price: Number(row.price || form.basePrice) || 0,
      slotsLeft: Math.max(
        0,
        (Number(row.totalSlots) || 0) - (row.bookedSlots ?? 0)
      ),
    }));

  return {
    id: "preview",
    slug: "preview",
    title: form.title || "Tiêu đề Tour của bạn",
    location: provinceName || "Chưa chọn địa điểm",
    description: form.description,
    images: form.photos.length
      ? form.photos.map((photo) => ({ url: photo.previewUrl }))
      : [{ url: "/image-notfound.png" }],
    durationDays: Number(form.durationDays),
    durationNights: Number(form.durationNights),
    basePrice,
    maxGuests: Math.max(0, ...departures.map((d) => d.slotsLeft)),
    includeServices: form.includeServices,
    excludeServices: form.excludeServices,
    itinerary: form.itinerary.filter((day) => day.title || day.description),
    tags: tagNames,
    rating: { avg: 0, count: 0 },
    bookingCount: 0,
    departures,
  };
}

export function TourDetailPreview({
  form,
  provinceName,
  tagNames,
}: {
  form: TourFormState;
  provinceName?: string;
  tagNames: string[];
}) {
  const tour = toPreviewDetail(form, provinceName, tagNames);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-card-line bg-card shadow-2xs">
      <div className="flex items-center gap-x-3 border-b border-card-divider bg-surface px-4 py-2.5">
        <div className="flex gap-x-1.5">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-yellow-400" />
          <span className="size-2.5 rounded-full bg-teal-400" />
        </div>
        <div className="flex-1 truncate rounded-lg border border-layer-line bg-layer px-3 py-1 text-xs text-muted-foreground-1">
          roamly.vn/tours/…
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
            { label: "Khám phá", href: "/explore?kind=tour" },
            { label: "Chi tiết tour" },
          ]}
          title="Chi tiết tour"
        />
        <section className="py-12">
          <TourGallerySlider images={tour.images} title={tour.title} />
          <div className="page-x">
            <TourDetailHeading tour={tour} />
            <div className="mt-8 grid gap-8 lg:grid-cols-3 xl:grid-cols-[2fr_1fr]">
              <div className="lg:col-span-2 xl:col-span-1">
                <TourContent tour={tour} />
              </div>
              <aside>
                <TourBookingCard tour={tour} />
              </aside>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
