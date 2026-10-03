import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tourRepo } from "@/entities/tour";
import { PageBanner } from "@/features/customer/components/page-banner";
import {
  TourBookingCard,
  TourComments,
  TourContent,
  TourDetailHeading,
  TourGallerySlider,
} from "@/features/customer/tour-detail";
import { toTourDetail } from "@/features/customer/tour-detail/lib/to-tour-detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tour = await tourRepo.findPublishedDetailBySlug(slug);
  return { title: tour ? `${tour.title} — Roamly` : "Không tìm thấy tour" };
}

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params;
  const row = await tourRepo.findPublishedDetailBySlug(slug);
  if (!row) notFound();
  const tour = toTourDetail(row);

  return (
    <main>
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
              <div className="mt-8">
                <TourComments />
              </div>
            </div>
            <aside>
              <TourBookingCard tour={tour} />
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
