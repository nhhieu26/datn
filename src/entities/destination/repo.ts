import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { type ListFilter, priceOrder, priceRange } from "../list-filter";
import type {
  CreateDestinationInput,
  Destination,
  DestinationWithRelations,
} from "./type";

export function findBySlug(slug: string): Promise<Destination | null> {
  return prisma.destination.findUnique({ where: { slug } });
}

export function findPublishedDetailBySlug(slug: string) {
  return prisma.destination.findFirst({
    where: { slug, isPublished: true },
    include: { province: true, tags: { include: { tag: true } } },
  });
}

export function findAll(): Promise<DestinationWithRelations[]> {
  return prisma.destination.findMany({
    include: {
      province: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function findRecent(take: number) {
  return prisma.destination.findMany({
    where: { isPublished: true },
    include: { province: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export function create(
  input: CreateDestinationInput & {
    slug: string;
    images: { url: string; fileId: string }[];
  }
): Promise<Destination> {
  const { tagIds, description, images, ...rest } = input;
  return prisma.destination.create({
    data: {
      ...rest,
      description: description || null,
      images,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });
}

export function remove(id: string): Promise<Destination> {
  return prisma.destination.delete({ where: { id } });
}

export async function findPaged(filter: ListFilter) {
  const price = priceRange(filter);
  const where: Prisma.DestinationWhereInput = {
    isPublished: true,
    ...(filter.province && { province: { name: filter.province } }),
    ...(filter.q && {
      OR: [
        { name: { contains: filter.q, mode: "insensitive" } },
        { description: { contains: filter.q, mode: "insensitive" } },
      ],
    }),
    ...(price && { ticketPrice: price }),
  };
  const order = priceOrder(filter.sort);
  const [items, total] = await prisma.$transaction([
    prisma.destination.findMany({
      where,
      include: { province: true },
      orderBy: order ? { ticketPrice: order } : { createdAt: "desc" },
      skip: filter.skip,
      take: filter.take,
    }),
    prisma.destination.count({ where }),
  ]);
  return { items, total };
}
