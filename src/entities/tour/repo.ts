import { prisma } from "@/lib/prisma";
import type { CreateTourInput, Tour } from "./type";

export function findBySlug(slug: string): Promise<Tour | null> {
  return prisma.tour.findUnique({ where: { slug } });
}

export function create(
  input: CreateTourInput & {
    providerProfileId: string;
    slug: string;
    images: { url: string; fileId: string }[];
  }
): Promise<Tour> {
  const { tagIds, departures, itinerary, images, ...rest } = input;
  return prisma.tour.create({
    data: {
      ...rest,
      images,
      itinerary,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
      departures: {
        create: departures.map((departure) => ({
          departureDate: departure.departureDate,
          returnDate: departure.returnDate,
          price: departure.price,
          totalSlots: departure.totalSlots,
        })),
      },
    },
  });
}

export async function removeWithRelations(id: string): Promise<void> {
  await prisma.$transaction([
    prisma.tourTag.deleteMany({ where: { tourId: id } }),
    prisma.tourDeparture.deleteMany({ where: { tourId: id } }),
    prisma.tour.deleteMany({ where: { id } }),
  ]);
}
