import { destinationRepo } from "@/entities/destination";
import {
  AskPlanTravelAiSection,
  ExploreByCategory,
  HeroSection,
  PersonalizedJourneySection,
  PopularDestinations,
} from "@/features/customer/landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roamly — Khám Phá Nhiều Hơn Một Điểm Đến",
  description:
    "Khách sạn, nhà hàng, tour trải nghiệm và những điểm đến độc đáo — tất cả trong một nơi.",
};

// ponytail: 6 mới nhất theo createdAt, chưa có trường popularity trong schema
export default async function TrangChuPage() {
  const destinations = await destinationRepo.findRecent(6);

  return (
    <>
      <HeroSection />
      <PersonalizedJourneySection />
      <ExploreByCategory />
      <AskPlanTravelAiSection />
      {destinations.length > 0 && (
        <PopularDestinations destinations={destinations} />
      )}
    </>
  );
}
