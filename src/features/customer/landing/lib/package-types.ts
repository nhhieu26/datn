import type { DestinationCardData, HotelCardData, RestaurantCardData, TourCardData } from "@/features/customer/components/cards";

export type PackageKind = "tour" | "hotel" | "restaurant" | "destination";

export type PackagesByKind = {
  tour: (TourCardData & { id: string })[];
  hotel: (HotelCardData & { id: string })[];
  restaurant: (RestaurantCardData & { id: string })[];
  destination: (DestinationCardData & { id: string })[];
};
