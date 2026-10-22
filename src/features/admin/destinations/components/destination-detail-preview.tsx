"use client";

import { PageBanner } from "@/features/customer/components/page-banner";
import {
  DestinationContent,
  DestinationDetailHeading,
  DestinationInfoCard,
} from "@/features/customer/destination-detail";
import type { DestinationDetail } from "@/features/customer/destination-detail/lib/to-destination-detail";
import { TourGallerySlider } from "@/features/customer/tour-detail";
import type { DestinationFormState } from "./destination-form";

const FALLBACK = [{ url: "/image-notfound.png" }];

// Dựng DestinationDetail từ state form, mapping giống toDestinationDetail bên customer
function toPreviewDetail(
  form: DestinationFormState,
  provinceName: string | undefined,
  tagNames: string[]
): DestinationDetail {
  const ticketPrice = Number(form.ticketPrice);
  return {
    name: form.name || "Tên địa điểm của bạn",
    location: provinceName || "Chưa chọn địa điểm",
    address: form.address,
    description: form.description,
    images: form.photos.length
      ? form.photos.map((photo) => ({ url: photo.previewUrl }))
      : FALLBACK,
    tags: tagNames,
    latitude: form.location?.lat ?? null,
    longitude: form.location?.lng ?? null,
    openTime: form.openTime,
    closeTime: form.closeTime,
    ticketPrice: ticketPrice > 0 ? ticketPrice : null,
  };
}

export function DestinationDetailPreview({
  form,
  provinceName,
  tagNames,
}: {
  form: DestinationFormState;
  provinceName?: string;
  tagNames: string[];
}) {
  const destination = toPreviewDetail(form, provinceName, tagNames);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-card-line bg-card shadow-2xs">
      <div className="flex items-center gap-x-3 border-b border-card-divider bg-surface px-4 py-2.5">
        <div className="flex gap-x-1.5">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-yellow-400" />
          <span className="size-2.5 rounded-full bg-teal-400" />
        </div>
        <div className="flex-1 truncate rounded-lg border border-layer-line bg-layer px-3 py-1 text-xs text-muted-foreground-1">
          roamly.vn/destinations/…
        </div>
        {form.isPublished ? (
          <span className="inline-flex items-center gap-x-1.5 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-800">
            <span className="size-1.5 rounded-full bg-teal-500" />
            Xuất bản ngay
          </span>
        ) : (
          <span className="inline-flex items-center gap-x-1.5 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
            <span className="size-1.5 rounded-full bg-yellow-500" />
            Lưu nháp
          </span>
        )}
      </div>

      {/* Chặn link để không rời form và mất dữ liệu đang nhập */}
      <div className="bg-white font-sans text-gray-900 antialiased [&_a]:pointer-events-none">
        <PageBanner
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Khám phá", href: "/explore?kind=destination" },
            { label: "Chi tiết điểm đến" },
          ]}
          title="Chi tiết điểm đến"
        />
        <section className="py-12">
          <div className="page-x">
            <DestinationDetailHeading destination={destination} />
          </div>
          <div className="mt-8">
            <TourGallerySlider
              images={destination.images}
              title={destination.name}
            />
          </div>
          <div className="page-x">
            <div className="mt-8 grid gap-8 lg:grid-cols-3 xl:grid-cols-[2fr_1fr]">
              <div className="lg:col-span-2 xl:col-span-1">
                <DestinationContent destination={destination} />
              </div>
              <aside>
                <DestinationInfoCard destination={destination} />
              </aside>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
