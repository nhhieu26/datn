import { destinationRepo } from "@/entities/destination";
import { hotelRepo } from "@/entities/hotel";
import { provinceRepo } from "@/entities/province";
import { restaurantRepo } from "@/entities/restaurant";
import { systemSettingRepo } from "@/entities/system-setting";
import { tourRepo } from "@/entities/tour";
import {
  AboutUsSection,
  AskPlanTravelAiSection,
  HeroSection,
  PopularPackagesSection,
  WhyChooseUsSection,
} from "@/features/customer/landing";
import { serializePackages } from "@/features/customer/landing/lib/serialize-packages";
import { RecommendedSection } from "@/features/customer/recommendations";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Roamly — Khám Phá Nhiều Hơn Một Điểm Đến",
  description:
    "Khách sạn, nhà hàng, tour trải nghiệm và những điểm đến độc đáo — tất cả trong một nơi.",
};

const PACKAGES_PER_KIND = 4;

export default async function TrangChuPage() {
  const [tours, hotels, restaurants, destinations, provinces, settings] =
    await Promise.all([
      tourRepo.findRecent(PACKAGES_PER_KIND),
      hotelRepo.findRecent(PACKAGES_PER_KIND),
      restaurantRepo.findRecent(PACKAGES_PER_KIND),
      destinationRepo.findRecent(PACKAGES_PER_KIND),
      provinceRepo.findAll(),
      systemSettingRepo.getSettings(),
    ]);

  const locations = provinces.map((province) => province.name);

  return (
    <>
      <HeroSection locations={locations} />
      <WhyChooseUsSection />
      {/* gọi Pinecone theo người dùng: stream riêng để không chặn phần còn lại của trang */}
      <Suspense fallback={null}>
        <RecommendedSection />
      </Suspense>
      <PopularPackagesSection
        packages={serializePackages({
          tours,
          hotels,
          restaurants,
          destinations,
        })}
      />
      <AboutUsSection
        videoUrl={settings.aboutVideoUrl}
        posterUrl={settings.aboutVideoPosterUrl}
      />
      <AskPlanTravelAiSection />
    </>
  );
}
