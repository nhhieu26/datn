import type { Metadata } from "next";
import { AskPlanTravelAiSection } from "@/features/khach-hang/trang-chu/components/ask-plan-travel-ai-section";
import { ExploreByCategory } from "@/features/khach-hang/trang-chu/components/explore-by-category";
import { HeroSection } from "@/features/khach-hang/trang-chu/components/hero-section";
import { PersonalizedJourneySection } from "@/features/khach-hang/trang-chu/components/personalized-journey-section";
import { PopularDestinations } from "@/features/khach-hang/trang-chu/components/popular-destinations";
import { SearchPillsBar } from "@/features/khach-hang/trang-chu/components/search-pills-bar";

export const metadata: Metadata = {
  title: "Roamly — Khám Phá Nhiều Hơn Một Điểm Đến",
  description:
    "Khách sạn, nhà hàng, tour trải nghiệm và những điểm đến độc đáo — tất cả trong một nơi.",
};

export default function TrangChuPage() {
  return (
    <>
      <SearchPillsBar />
      <HeroSection />
      <PersonalizedJourneySection />
      <ExploreByCategory />
      <AskPlanTravelAiSection />
      <PopularDestinations />
    </>
  );
}
