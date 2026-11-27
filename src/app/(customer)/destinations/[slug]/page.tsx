import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { destinationRepo } from "@/entities/destination";
import { FadeIn } from "@/features/customer/components/motion";
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
          <FadeIn duration={0.48} inView={false} y={14}>
            <DestinationDetailHeading destination={destination} />
          </FadeIn>
        </div>
        <FadeIn className="mt-8" delay={0.08} duration={0.52} inView={false} y={14}>
          <TourGallerySlider
            images={destination.images}
            title={destination.name}
          />
        </FadeIn>
        <div className="page-x">
          <div className="mt-8 grid gap-8 lg:grid-cols-3 xl:grid-cols-[2fr_1fr]">
            <div className="lg:col-span-2 xl:col-span-1">
              <FadeIn delay={0.12} y={16}>
                <DestinationContent destination={destination} />
              </FadeIn>
            </div>
            <FadeIn delay={0.16} duration={0.55} inView={false} x={18} y={12}>
              <aside>
                <DestinationInfoCard destination={destination} />
              </aside>
            </FadeIn>
          </div>
        </div>
      </section>
    </main>
  );
}
