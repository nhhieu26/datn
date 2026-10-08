import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { destinationRepo } from "@/entities/destination";
import { PageBanner } from "@/features/customer/components/page-banner";
import {
  DestinationContent,
  DestinationDetailHeading,
  DestinationInfoCard,
} from "@/features/customer/destination-detail";
import { toDestinationDetail } from "@/features/customer/destination-detail/lib/to-destination-detail";
import { TourGallerySlider } from "@/features/customer/tour-detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const row = await destinationRepo.findPublishedDetailBySlug(slug);
  return {
    title: row ? `${row.name} — Roamly` : "Không tìm thấy điểm đến",
  };
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params;
  const row = await destinationRepo.findPublishedDetailBySlug(slug);
  if (!row) notFound();
  const destination = toDestinationDetail(row);

  return (
    <main>
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
    </main>
  );
}
