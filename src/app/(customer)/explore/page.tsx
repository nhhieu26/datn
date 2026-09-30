import { ExplorePageContent } from "@/features/customer/explore";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khám phá — Roamly",
  description:
    "Khám phá tour, khách sạn, nhà hàng và điểm đến phù hợp với phong cách du lịch của bạn.",
};

export default function ExplorePage() {
  return <ExplorePageContent />;
}
