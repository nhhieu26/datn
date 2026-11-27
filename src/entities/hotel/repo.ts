import type {
  BookingStatus,
  Prisma,
  ServiceStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { hotelBookingCounts } from "../booking-counts";
import {
  average,
  needsScan,
  paginateByPrice,
  paginateByRelevance,
  ratingWhere,
  searchWhere,
  type ListFilter,
} from "../list-filter";
import type {
  Hotel,
  HotelForProvider,
  HotelForProviderList,
  RoomDraftInput,
  UpdateHotelInput,
} from "./type";

type UploadedImage = { url: string; fileId: string };

// Booking chưa kết thúc: khách sạn còn các booking này thì chưa được xóa mềm
const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "pending_payment",
  "pending_confirmation",
  "paid",
  "confirmed",
];

export function findBySlug(slug: string): Promise<Hotel | null> {
  return prisma.hotel.findUnique({ where: { slug } });
}

export function findPublishedDetailBySlug(slug: string) {
  return prisma.hotel.findFirst({
    where: { slug, status: "published", deletedAt: null },
    include: {
      province: true,
      tags: { include: { tag: true } },
      rooms: { where: { status: "published" }, orderBy: { basePrice: "asc" } },
    },
  });
}

/** Danh sách gọn (id, tên) cho bộ chọn dịch vụ trên lịch của provider. */
export function findOptionsByProviderProfileId(providerProfileId: string) {
  return prisma.hotel.findMany({
    where: { providerProfileId, deletedAt: null },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });
}

export function findAllByProviderProfileId(
  providerProfileId: string
): Promise<HotelForProviderList[]> {
  return prisma.hotel.findMany({
    where: { providerProfileId, deletedAt: null },
    include: {
      province: true,
      tags: { include: { tag: true } },
      rooms: {
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

export function create(input: {
  name: string;
  provinceId: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  amenities: string[];
  providerProfileId: string;
  slug: string;
  images: UploadedImage[];
  tagIds: string[];
  rooms: (RoomDraftInput & { images: UploadedImage[] })[];
}): Promise<Hotel> {
  const { rooms, images, tagIds, ...rest } = input;
  return prisma.hotel.create({
    data: {
      ...rest,
      images,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
      rooms: {
        create: rooms.map((room) => ({
          name: room.name,
          description: room.description,
          capacity: room.capacity,
          quantity: room.quantity,
          basePrice: room.basePrice,
          amenities: room.amenities,
          images: room.images,
        })),
      },
    },
  });
}

export function findByIdForProvider(
  id: string,
  providerProfileId: string
): Promise<HotelForProvider | null> {
  return prisma.hotel.findFirst({
    where: { id, providerProfileId, deletedAt: null },
    include: {
      province: true,
      tags: { include: { tag: true } },
      rooms: {
        orderBy: { createdAt: "asc" },
        // Chỉ đếm đơn còn hiệu lực; đơn đã kết thúc đã lưu snapshot nên không chặn xóa phòng
        include: {
          _count: {
            select: {
              bookings: { where: { status: { in: ACTIVE_BOOKING_STATUSES } } },
            },
          },
        },
      },
    },
  });
}

export async function update(
  id: string,
  input: Omit<UpdateHotelInput, "rooms"> & {
    images: UploadedImage[];
    rooms: (RoomDraftInput & { images: UploadedImage[] })[];
    removedRoomIds: string[];
  }
): Promise<Hotel> {
  const { tagIds, rooms, images, removedRoomIds, ...rest } = input;

  return prisma.$transaction(async (tx) => {
    const hotel = await tx.hotel.update({
      where: { id },
      data: { ...rest, images },
    });

    await tx.hotelTag.deleteMany({ where: { hotelId: id } });
    await tx.hotelTag.createMany({
      data: tagIds.map((tagId) => ({ hotelId: id, tagId })),
    });

    // chỉ xóa phòng chưa từng có booking (HotelBooking.roomId SetNull)
    if (removedRoomIds.length > 0) {
      await tx.room.deleteMany({
        where: {
          id: { in: removedRoomIds },
          hotelId: id,
          bookings: { none: {} },
        },
      });
    }

    for (const room of rooms) {
      const data = {
        name: room.name,
        description: room.description,
        capacity: room.capacity,
        quantity: room.quantity,
        basePrice: room.basePrice,
        amenities: room.amenities,
        images: room.images,
      };
      if (room.id) {
        await tx.room.update({ where: { id: room.id, hotelId: id }, data });
      } else {
        await tx.room.create({ data: { ...data, hotelId: id } });
      }
    }

    return hotel;
  });
}

export function remove(id: string): Promise<Hotel> {
  return prisma.hotel.delete({ where: { id } });
}

/**
 * Dừng bán nhiều hotel và hẹn ngày xóa. Bỏ qua hotel không thuộc provider hoặc đã dừng trước đó.
 * Trả về các hotel thực sự được hẹn xóa.
 */
export function scheduleDeletionMany(
  ids: string[],
  providerProfileId: string,
  deleteAt: Date
): Promise<{ id: string; slug: string }[]> {
  return prisma.hotel.updateManyAndReturn({
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
 * Đổi trạng thái mở bán / tạm dừng cho nhiều hotel của một provider.
 * Bỏ qua hotel đã dừng (đang chờ xóa) hoặc đã ở sẵn trạng thái đích.
 * Trả về các hotel thực sự được đổi.
 */
export function setStatusMany(
  ids: string[],
  providerProfileId: string,
  status: ServiceStatus
): Promise<{ id: string; slug: string }[]> {
  return prisma.hotel.updateManyAndReturn({
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

/** Hủy lịch xóa, mở bán lại khách sạn đã dừng. Trả về 0 nếu khách sạn không ở trạng thái đã dừng. */
export async function cancelDeletion(
  id: string,
  providerProfileId: string
): Promise<number> {
  const { count } = await prisma.hotel.updateMany({
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

/** Xóa mềm các khách sạn đã tới hạn xóa và không còn booking chưa kết thúc. */
export async function softDeleteExpired(now: Date): Promise<number> {
  const { count } = await prisma.hotel.updateMany({
    where: {
      deleteScheduledAt: { lte: now },
      deletedAt: null,
      rooms: {
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
  return prisma.hotel.findMany({
    where: { status: "published", deletedAt: null },
    include: { province: true, rooms: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

/** Khách sạn đang bán theo danh sách id (cùng dữ liệu với findRecent), không giữ thứ tự. */
export function findPublishedByIds(ids: string[]) {
  return prisma.hotel.findMany({
    where: { id: { in: ids }, status: "published", deletedAt: null },
    include: { province: true, rooms: true },
  });
}

export async function findPaged(filter: ListFilter) {
  const where: Prisma.HotelWhereInput = {
    status: "published",
    deletedAt: null,
    ...ratingWhere(filter),
    ...(filter.province && { province: { name: filter.province } }),
    ...(filter.tag && { tags: { some: { tag: { name: filter.tag } } } }),
    ...searchWhere<Prisma.HotelWhereInput>(filter, (q) => [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ]),
  };
  const include = { province: true, rooms: true } as const;
  const orderBy = { createdAt: "desc" } as const;
  const roomPrice = (h: { rooms: { basePrice: unknown }[] }) =>
    average(h.rooms.map((r) => Number(r.basePrice)));

  if (filter.sort === "relevance") {
    const all = await prisma.hotel.findMany({ where, include });
    return paginateByRelevance(all, (h) => h.name, roomPrice, filter);
  }

  // giá khách sạn = giá phòng trung bình
  if (needsScan(filter)) {
    const [all, counts] = await Promise.all([
      prisma.hotel.findMany({ where, include, orderBy }),
      filter.sort === "popular" ? hotelBookingCounts() : undefined,
    ]);
    return paginateByPrice(all, roomPrice, filter, counts);
  }
  const [items, total] = await Promise.all([
    prisma.hotel.findMany({
      where,
      include,
      orderBy,
      skip: filter.skip,
      take: filter.take,
    }),
    prisma.hotel.count({ where }),
  ]);
  return { items, total };
}

/** Số khách sạn đang mở bán của provider (không tính bản đang chờ xóa); `createdFrom` lọc theo ngày tạo. */
export function countActiveByProviderProfileId(
  providerProfileId: string,
  createdFrom?: Date
): Promise<number> {
  return prisma.hotel.count({
    where: {
      providerProfileId,
      status: "published",
      deletedAt: null,
      deleteScheduledAt: null,
      ...(createdFrom && { createdAt: { gte: createdFrom } }),
    },
  });
}
