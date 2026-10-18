import type { BookingStatus, Prisma } from "@/generated/prisma/client";
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
  RestaurantForProviderList,
  RestaurantWithRelations,
  UpdateRestaurantInput,
} from "./type";

// Đơn đặt bàn chưa kết thúc: nhà hàng còn các đơn này thì chưa được xóa mềm
const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "pending_confirmation",
  "confirmed",
];

export function findBySlug(slug: string): Promise<Restaurant | null> {
  return prisma.restaurant.findUnique({ where: { slug } });
}

export function findPublishedDetailBySlug(slug: string) {
  return prisma.restaurant.findFirst({
    where: { slug, status: "published", deletedAt: null },
    include: {
      province: true,
      tags: { include: { tag: true } },
      timeSlots: true,
    },
  });
}

export function findAllByProviderProfileId(
  providerProfileId: string
): Promise<RestaurantForProviderList[]> {
  return prisma.restaurant.findMany({
    where: { providerProfileId, deletedAt: null },
    include: {
      province: true,
      tags: { include: { tag: true } },
      timeSlots: true,
      _count: {
        select: {
          bookings: {
            where: { status: { in: ["paid", "confirmed", "completed"] } },
          },
        },
      },
      bookings: {
        where: { status: { in: ACTIVE_BOOKING_STATUSES } },
        select: { id: true },
      },
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

export function findByIdForProvider(
  id: string,
  providerProfileId: string
): Promise<RestaurantWithRelations | null> {
  return prisma.restaurant.findFirst({
    where: { id, providerProfileId, deletedAt: null },
    include: {
      province: true,
      tags: { include: { tag: true } },
      timeSlots: { orderBy: { startTime: "asc" } },
    },
  });
}

export async function update(
  id: string,
  input: UpdateRestaurantInput & {
    images: { url: string; fileId: string }[];
  }
): Promise<Restaurant> {
  const { tagIds, menu, timeSlots, images, ...rest } = input;
  const startTimes = timeSlots.map((slot) => slot.startTime);

  return prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.update({
      where: { id },
      data: { ...rest, images, menu },
    });

    await tx.restaurantTag.deleteMany({ where: { restaurantId: id } });
    await tx.restaurantTag.createMany({
      data: tagIds.map((tagId) => ({ restaurantId: id, tagId })),
    });

    // Giữ slot cũ vẫn được chọn để booking không mất liên kết (booking -> slot là SetNull)
    await tx.restaurantTimeSlot.deleteMany({
      where: { restaurantId: id, startTime: { notIn: startTimes } },
    });
    for (const slot of timeSlots) {
      await tx.restaurantTimeSlot.upsert({
        where: {
          restaurantId_startTime: { restaurantId: id, startTime: slot.startTime },
        },
        update: { endTime: slot.endTime },
        create: {
          restaurantId: id,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
      });
    }

    return restaurant;
  });
}

export function remove(id: string): Promise<Restaurant> {
  return prisma.restaurant.delete({ where: { id } });
}

/** Dừng bán nhà hàng và hẹn ngày xóa. Trả về số nhà hàng bị ảnh hưởng (0 nếu không tìm thấy hoặc đã dừng). */
export async function scheduleDeletion(
  id: string,
  providerProfileId: string,
  deleteAt: Date
): Promise<number> {
  const { count } = await prisma.restaurant.updateMany({
    where: { id, providerProfileId, deletedAt: null, deleteScheduledAt: null },
    data: { status: "paused", deleteScheduledAt: deleteAt },
  });
  return count;
}

/** Hủy lịch xóa, mở bán lại nhà hàng đã dừng. Trả về 0 nếu nhà hàng không ở trạng thái đã dừng. */
export async function cancelDeletion(
  id: string,
  providerProfileId: string
): Promise<number> {
  const { count } = await prisma.restaurant.updateMany({
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

/** Xóa mềm các nhà hàng đã tới hạn xóa và không còn đơn đặt bàn chưa kết thúc. */
export async function softDeleteExpired(now: Date): Promise<number> {
  const { count } = await prisma.restaurant.updateMany({
    where: {
      deleteScheduledAt: { lte: now },
      deletedAt: null,
      bookings: { none: { status: { in: ACTIVE_BOOKING_STATUSES } } },
    },
    data: { deletedAt: now },
  });
  return count;
}

export function findRecent(take: number) {
  return prisma.restaurant.findMany({
    where: { status: "published", deletedAt: null },
    include: { province: true, timeSlots: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function findPaged(filter: ListFilter) {
  const where: Prisma.RestaurantWhereInput = {
    status: "published",
    deletedAt: null,
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
  const [items, total] = await Promise.all([
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
