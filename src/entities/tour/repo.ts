import type {
  BookingStatus,
  Prisma,
  ServiceStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { tourBookingCounts } from "../booking-counts";
import {
  type ListFilter,
  paginateByPrice,
  paginateByRelevance,
  priceOrder,
  priceRange,
  ratingWhere,
  searchWhere,
} from "../list-filter";
import type {
  CreateTourInput,
  Tour,
  TourForProvider,
  TourWithRelations,
  UpdateTourInput,
} from "./type";

// Booking chưa kết thúc: tour còn các booking này thì chưa được xóa mềm
const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "pending_payment",
  "pending_confirmation",
  "paid",
  "confirmed",
];

export function findBySlug(slug: string): Promise<Tour | null> {
  return prisma.tour.findUnique({ where: { slug } });
}

export function findPublishedDetailBySlug(slug: string) {
  return prisma.tour.findFirst({
    where: { slug, status: "published", deletedAt: null },
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

/** Danh sách gọn (id, tên) cho bộ chọn dịch vụ trên lịch của provider. */
export function findOptionsByProviderProfileId(providerProfileId: string) {
  return prisma.tour.findMany({
    where: { providerProfileId, deletedAt: null },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });
}

export function findAllByProviderProfileId(
  providerProfileId: string
): Promise<TourForProvider[]> {
  return prisma.tour.findMany({
    where: { providerProfileId, deletedAt: null },
    include: {
      province: true,
      tags: { include: { tag: true } },
      departures: {
        include: {
          _count: {
            select: {
              bookings: {
                where: { status: "completed" },
              },
            },
          },
          bookings: {
            where: { status: { in: ACTIVE_BOOKING_STATUSES } },
            select: { id: true },
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
    where: { id, providerProfileId, deletedAt: null },
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

/**
 * Dừng bán nhiều tour và hẹn ngày xóa. Bỏ qua tour không thuộc provider hoặc đã dừng trước đó.
 * Trả về các tour thực sự được hẹn xóa.
 */
export function scheduleDeletionMany(
  ids: string[],
  providerProfileId: string,
  deleteAt: Date
): Promise<{ id: string; slug: string }[]> {
  return prisma.tour.updateManyAndReturn({
    where: {
      id: { in: ids },
      providerProfileId,
      deletedAt: null,
      deleteScheduledAt: null,
    },
    data: { status: "paused", deleteScheduledAt: deleteAt },
    select: { id: true, slug: true },
  });
}

/**
 * Đổi trạng thái mở bán / tạm dừng cho nhiều tour của một provider.
 * Bỏ qua tour đã dừng (đang chờ xóa) hoặc đã ở sẵn trạng thái đích.
 * Trả về các tour thực sự được đổi.
 */
export function setStatusMany(
  ids: string[],
  providerProfileId: string,
  status: ServiceStatus
): Promise<{ id: string; slug: string }[]> {
  return prisma.tour.updateManyAndReturn({
    where: {
      id: { in: ids },
      providerProfileId,
      deletedAt: null,
      deleteScheduledAt: null,
      status: { not: status },
    },
    data: { status },
    select: { id: true, slug: true },
  });
}

/** Hủy lịch xóa, mở bán lại tour đã dừng. Trả về 0 nếu tour không ở trạng thái đã dừng. */
export async function cancelDeletion(
  id: string,
  providerProfileId: string
): Promise<number> {
  const { count } = await prisma.tour.updateMany({
    where: {
      id,
      providerProfileId,
      deletedAt: null,
      deleteScheduledAt: { not: null },
    },
    data: { status: "published", deleteScheduledAt: null },
  });
  return count;
}

/** Xóa mềm các tour đã tới hạn xóa và không còn booking chưa kết thúc. */
export async function softDeleteExpired(now: Date): Promise<number> {
  const { count } = await prisma.tour.updateMany({
    where: {
      deleteScheduledAt: { lte: now },
      deletedAt: null,
      departures: {
        none: {
          bookings: { some: { status: { in: ACTIVE_BOOKING_STATUSES } } },
        },
      },
    },
    data: { deletedAt: now },
  });
  return count;
}

export function findRecent(take: number) {
  return prisma.tour.findMany({
    where: { status: "published", deletedAt: null },
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

/** Tour đang bán theo danh sách id (cùng dữ liệu với findRecent), không giữ thứ tự. */
export function findPublishedByIds(ids: string[]) {
  return prisma.tour.findMany({
    where: { id: { in: ids }, status: "published", deletedAt: null },
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
    deletedAt: null,
    ...ratingWhere(filter),
    ...(filter.province && { province: { name: filter.province } }),
    ...(filter.tag && { tags: { some: { tag: { name: filter.tag } } } }),
    ...searchWhere<Prisma.TourWhereInput>(filter, (q) => [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ]),
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
  const include = {
    province: true,
    _count: {
      select: {
        departures: {
          where: { status: "scheduled", departureDate: { gt: now } },
        },
      },
    },
  } satisfies Prisma.TourInclude;

  if (filter.sort === "relevance") {
    const all = await prisma.tour.findMany({ where, include });
    return paginateByRelevance(all, (t) => t.title, (t) => Number(t.basePrice), filter);
  }
  // "Phổ biến": lượt đặt không orderBy được bằng Prisma → quét hết rồi sort trong bộ nhớ
  if (!order && filter.sort === "popular") {
    const [all, counts] = await Promise.all([
      prisma.tour.findMany({ where, include, orderBy: { createdAt: "desc" } }),
      tourBookingCounts(),
    ]);
    return paginateByPrice(all, (t) => Number(t.basePrice), filter, counts);
  }
  const [items, total] = await Promise.all([
    prisma.tour.findMany({
      where,
      include,
      orderBy: order ? { basePrice: order } : { createdAt: "desc" },
      skip: filter.skip,
      take: filter.take,
    }),
    prisma.tour.count({ where }),
  ]);
  return { items, total };
}

/** Số tour đang mở bán của provider (không tính bản đang chờ xóa); `createdFrom` lọc theo ngày tạo. */
export function countActiveByProviderProfileId(
  providerProfileId: string,
  createdFrom?: Date
): Promise<number> {
  return prisma.tour.count({
    where: {
      providerProfileId,
      status: "published",
      deletedAt: null,
      deleteScheduledAt: null,
      ...(createdFrom && { createdAt: { gte: createdFrom } }),
    },
  });
}
