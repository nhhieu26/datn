import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { type ListFilter, priceOrder, priceRange } from "../list-filter";
import type { CreateTourInput, Tour, TourWithRelations } from "./type";

export function findBySlug(slug: string): Promise<Tour | null> {
  return prisma.tour.findUnique({ where: { slug } });
}

export function findPublishedDetailBySlug(slug: string) {
  return prisma.tour.findFirst({
    where: { slug, status: "published" },
    include: {
      province: true,
      tags: { include: { tag: true } },
      departures: {
        where: { status: "scheduled" },
        orderBy: { departureDate: "asc" },
      },
    },
  });
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
    include: {
      province: true,
      _count: { select: { departures: { where: { status: "scheduled" } } } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function findPaged(
  filter: ListFilter & { from?: Date; to?: Date }
) {
  const price = priceRange(filter);
  const hasDate = filter.from || filter.to;
  const where: Prisma.TourWhereInput = {
    status: "published",
    ...(filter.province && { province: { name: filter.province } }),
    ...(filter.tag && { tags: { some: { tag: { name: filter.tag } } } }),
    ...(filter.q && {
      OR: [
        { title: { contains: filter.q, mode: "insensitive" } },
        { description: { contains: filter.q, mode: "insensitive" } },
      ],
    }),
    ...(price && { basePrice: price }),
    ...(hasDate && {
      departures: {
        some: {
          status: "scheduled",
          departureDate: { gte: filter.from, lte: filter.to },
        },
      },
    }),
  };
  const order = priceOrder(filter.sort);
  const [items, total] = await prisma.$transaction([
    prisma.tour.findMany({
      where,
      include: {
        province: true,
        _count: {
          select: { departures: { where: { status: "scheduled" } } },
        },
      },
      orderBy: order ? { basePrice: order } : { createdAt: "desc" },
      skip: filter.skip,
      take: filter.take,
    }),
    prisma.tour.count({ where }),
  ]);
  return { items, total };
}
