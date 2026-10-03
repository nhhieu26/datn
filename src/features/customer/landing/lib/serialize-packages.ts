import type { destinationRepo } from "@/entities/destination";
import type { hotelRepo } from "@/entities/hotel";
import type { restaurantRepo } from "@/entities/restaurant";
import type { tourRepo } from "@/entities/tour";
import {
  toDestinationItem,
  toHotelItem,
  toRestaurantItem,
  toTourItem,
} from "@/features/customer/explore/lib/to-explore-item";
import type { PackagesByKind } from "./package-types";

export function serializePackages(data: {
  tours: Awaited<ReturnType<typeof tourRepo.findRecent>>;
  hotels: Awaited<ReturnType<typeof hotelRepo.findRecent>>;
  restaurants: Awaited<ReturnType<typeof restaurantRepo.findRecent>>;
  destinations: Awaited<ReturnType<typeof destinationRepo.findRecent>>;
}): PackagesByKind {
  return {
    tour: data.tours.map(toTourItem),
    hotel: data.hotels.map(toHotelItem),
    restaurant: data.restaurants.map(toRestaurantItem),
    destination: data.destinations.map(toDestinationItem),
  };
}
