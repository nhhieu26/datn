import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { type ListFilter, priceOrder, priceRange } from "../list-filter";
import type {
  CreateTourInput,
  Tour,
  TourForProvider,
  TourWithRelations,
  UpdateTourInput,
} from "./type";

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
        where: { status: "scheduled", departureDate: { gt: new Date() } },
        orderBy: { departureDate: "asc" },
      },
    },
  });
}

export function findAllByProviderProfileId(
  providerProfileId: string
): Promise<TourForProvider[]> {
  return prisma.tour.findMany({
    where: { providerProfileId },
    include: {
      province: true,
      tags: { include: { tag: true } },
      departures: {
        include: {
          _count: {
            select: {
              bookings: {
                where: { status: { in: ["paid", "confirmed", "completed"] } },
              },
            },
          },
        },
      },
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

export function findByIdForProvider(
  id: string,
  providerProfileId: string
): Promise<TourWithRelations | null> {
  return prisma.tour.findFirst({
    where: { id, providerProfileId },
    include: {
      province: true,
      tags: { include: { tag: true } },
      departures: { orderBy: { departureDate: "asc" } },
    },
  });
}

export async function update(
  id: string,
  input: UpdateTourInput & {
    images: { url: string; fileId: string }[];
    removedDepartureIds: string[];
  }
): Promise<Tour> {
  const { tagIds, departures, itinerary, images, removedDepartureIds, ...rest } =
    input;

  return prisma.$transaction(async (tx) => {
    const tour = await tx.tour.update({
      where: { id },
      data: { ...rest, images, itinerary },
    });

    await tx.tourTag.deleteMany({ where: { tourId: id } });
    await tx.tourTag.createMany({
      data: tagIds.map((tagId) => ({ tourId: id, tagId })),
    });

    // Đợt đã có người đặt hoặc đã diễn ra thì giữ nguyên, kể cả khi khách vừa đặt lúc đang lưu
    const now = new Date();
    if (removedDepartureIds.length > 0) {
      await tx.tourDeparture.deleteMany({
        where: {
          id: { in: removedDepartureIds },
          tourId: id,
          bookedSlots: 0,
          departureDate: { gt: now },
        },
      });
    }

    for (const departure of departures) {
      const data = {
        departureDate: departure.departureDate,
        returnDate: departure.returnDate,
        price: departure.price,
        totalSlots: departure.totalSlots,
      };
      if (departure.id) {
        await tx.tourDeparture.updateMany({
          where: {
            id: departure.id,
            tourId: id,
            bookedSlots: 0,
            departureDate: { gt: now },
          },
          data,
        });
      } else {
        await tx.tourDeparture.create({ data: { ...data, tourId: id } });
      }
    }

    return tour;
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
      _count: {
        select: {
          departures: {
            where: { status: "scheduled", departureDate: { gt: new Date() } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function findPaged(
  filter: ListFilter & { from?: Date; to?: Date }
) {
  const price = priceRange(filter);
  const now = new Date();
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
          departureDate: { gt: now, gte: filter.from, lte: filter.to },
        },
      },
    }),
  };
  const order = priceOrder(filter.sort);
  const [items, total] = await Promise.all([
    prisma.tour.findMany({
      where,
      include: {
        province: true,
        _count: {
          select: {
            departures: {
              where: { status: "scheduled", departureDate: { gt: now } },
            },
          },
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
