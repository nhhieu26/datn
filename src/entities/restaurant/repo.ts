import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  menuAveragePrice,
  needsPriceScan,
  paginateByPrice,
  type ListFilter,
} from "../list-filter";
import type {
  CreateRestaurantInput,
  Restaurant,
  RestaurantWithRelations,
} from "./type";

export function findBySlug(slug: string): Promise<Restaurant | null> {
  return prisma.restaurant.findUnique({ where: { slug } });
}

export function findPublishedDetailBySlug(slug: string) {
  return prisma.restaurant.findFirst({
    where: { slug, status: "published" },
    include: {
      province: true,
      tags: { include: { tag: true } },
      timeSlots: true,
    },
  });
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
    include: { province: true, timeSlots: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function findPaged(filter: ListFilter) {
  const where: Prisma.RestaurantWhereInput = {
    status: "published",
    ...(filter.province && { province: { name: filter.province } }),
    ...(filter.tag && { tags: { some: { tag: { name: filter.tag } } } }),
    ...(filter.q && {
      OR: [
        { name: { contains: filter.q, mode: "insensitive" } },
        { address: { contains: filter.q, mode: "insensitive" } },
      ],
    }),
  };
  const include = { province: true, timeSlots: true } as const;
  const orderBy = { createdAt: "desc" } as const;

  // giá nhà hàng = giá món trung bình trong menu
  if (needsPriceScan(filter)) {
    const all = await prisma.restaurant.findMany({ where, include, orderBy });
    return paginateByPrice(all, (r) => menuAveragePrice(r.menu), filter);
  }
  const [items, total] = await prisma.$transaction([
    prisma.restaurant.findMany({
      where,
      include,
      orderBy,
      skip: filter.skip,
      take: filter.take,
    }),
    prisma.restaurant.count({ where }),
  ]);
  return { items, total };
}
