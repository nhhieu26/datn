import { prisma } from "@/lib/prisma";
import type {
  CreateRestaurantInput,
  Restaurant,
  RestaurantWithRelations,
} from "./type";

export function findBySlug(slug: string): Promise<Restaurant | null> {
  return prisma.restaurant.findUnique({ where: { slug } });
}

export function findAllByProviderProfileId(
  providerProfileId: string
): Promise<RestaurantWithRelations[]> {
  return prisma.restaurant.findMany({
    where: { providerProfileId },
    include: {
      province: true,
      tags: { include: { tag: true } },
      timeSlots: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export function create(
  input: CreateRestaurantInput & {
    providerProfileId: string;
    slug: string;
    images: { url: string; fileId: string }[];
  }
): Promise<Restaurant> {
  const { tagIds, menu, timeSlots, images, ...rest } = input;
  return prisma.restaurant.create({
    data: {
      ...rest,
      images,
      menu,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
      timeSlots: {
        create: timeSlots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      },
    },
  });
}

export function remove(id: string): Promise<Restaurant> {
  return prisma.restaurant.delete({ where: { id } });
}

export function findRecent(take: number) {
  return prisma.restaurant.findMany({
    where: { status: "published" },
    include: { province: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}
