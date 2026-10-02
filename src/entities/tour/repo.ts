import { prisma } from "@/lib/prisma";
import type { CreateTourInput, Tour, TourWithRelations } from "./type";

export function findBySlug(slug: string): Promise<Tour | null> {
  return prisma.tour.findUnique({ where: { slug } });
}

export function findAllByProviderProfileId(
  providerProfileId: string
): Promise<TourWithRelations[]> {
  return prisma.tour.findMany({
    where: { providerProfileId },
    include: {
      province: true,
      tags: { include: { tag: true } },
      departures: true,
    },
    orderBy: { createdAt: "desc" },
  });
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

export function remove(id: string): Promise<Tour> {
  return prisma.tour.delete({ where: { id } });
}

export function findRecent(take: number) {
  return prisma.tour.findMany({
    where: { status: "published" },
    include: { province: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}
