import { destinationRepo } from "@/entities/destination";
import { hotelRepo } from "@/entities/hotel";
import { provinceRepo } from "@/entities/province";
import { restaurantRepo } from "@/entities/restaurant";
import { tourRepo } from "@/entities/tour";
import {
  AboutUsSection,
  AskPlanTravelAiSection,
  HeroSection,
  PopularPackagesSection,
  WhyChooseUsSection,
} from "@/features/customer/landing";
import { serializePackages } from "@/features/customer/landing/lib/serialize-packages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roamly — Khám Phá Nhiều Hơn Một Điểm Đến",
  description:
    "Khách sạn, nhà hàng, tour trải nghiệm và những điểm đến độc đáo — tất cả trong một nơi.",
};

const PACKAGES_PER_KIND = 4;

export default async function TrangChuPage() {
  const [tours, hotels, restaurants, destinations, provinces] = await Promise.all([
    tourRepo.findRecent(PACKAGES_PER_KIND),
    hotelRepo.findRecent(PACKAGES_PER_KIND),
    restaurantRepo.findRecent(PACKAGES_PER_KIND),
    destinationRepo.findRecent(PACKAGES_PER_KIND),
    provinceRepo.findAll(),
  ]);

  const locations = provinces.map((province) => province.name);

  return (
    <>
      <HeroSection locations={locations} />
      <WhyChooseUsSection />
      <PopularPackagesSection
        packages={serializePackages({ tours, hotels, restaurants, destinations })}
      />
      <AboutUsSection />
      <AskPlanTravelAiSection />
    </>
  );
}
