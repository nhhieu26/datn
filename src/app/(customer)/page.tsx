import {
  AskPlanTravelAiSection,
  ExploreByCategory,
  HeroSection,
  PersonalizedJourneySection,
  PopularDestinations,
  SearchPillsBar,
} from "@/features/customer/landing";
import type { Metadata } from "next";

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
