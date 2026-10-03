import type { ExploreItem } from "@/features/customer/explore/data";
import { DestinationCard } from "./destination-card";
import { HotelCard } from "./hotel-card";
import { RestaurantCard } from "./restaurant-card";
import { TourCard } from "./tour-card";

export function ExploreCard({ item }: { item: ExploreItem }) {
  switch (item.kind) {
    case "destination":
      return <DestinationCard item={item} />;
    case "hotel":
      return <HotelCard item={item} />;
    case "restaurant":
      return <RestaurantCard item={item} />;
    case "tour":
      return <TourCard item={item} />;
  }
}
