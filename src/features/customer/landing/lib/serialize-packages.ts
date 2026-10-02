import type { destinationRepo } from "@/entities/destination";
import type { hotelRepo } from "@/entities/hotel";
import type { restaurantRepo } from "@/entities/restaurant";
import type { tourRepo } from "@/entities/tour";
import type { PackagesByKind } from "./package-types";

type Tours = Awaited<ReturnType<typeof tourRepo.findRecent>>;
type Hotels = Awaited<ReturnType<typeof hotelRepo.findRecent>>;
type Restaurants = Awaited<ReturnType<typeof restaurantRepo.findRecent>>;
type Destinations = Awaited<ReturnType<typeof destinationRepo.findRecent>>;

// Prisma Decimal không truyền được sang Client Component → đổi sang number và chỉ giữ field card cần
export function serializePackages(data: {
  tours: Tours;
  hotels: Hotels;
  restaurants: Restaurants;
  destinations: Destinations;
}): PackagesByKind {
  return {
    tour: data.tours.map((tour) => ({
      id: tour.id,
      title: tour.title,
      images: tour.images,
      durationDays: tour.durationDays,
      durationNights: tour.durationNights,
      basePrice: Number(tour.basePrice),
      province: { name: tour.province.name },
    })),
    hotel: data.hotels.map((hotel) => ({
      id: hotel.id,
      name: hotel.name,
      images: hotel.images,
      amenities: hotel.amenities,
      rooms: hotel.rooms.map((room) => ({ basePrice: Number(room.basePrice) })),
      province: { name: hotel.province.name },
    })),
    restaurant: data.restaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      images: restaurant.images,
      capacity: restaurant.capacity,
      province: { name: restaurant.province.name },
    })),
    destination: data.destinations.map((destination) => ({
      id: destination.id,
      name: destination.name,
      images: destination.images,
      address: destination.address,
      ticketPrice:
        destination.ticketPrice != null ? Number(destination.ticketPrice) : null,
      province: { name: destination.province.name },
    })),
  };
}
