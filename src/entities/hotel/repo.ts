import type { BookingStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  average,
  needsPriceScan,
  paginateByPrice,
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
                where: { status: { in: ["paid", "confirmed", "completed"] } },
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

/** Dừng bán khách sạn và hẹn ngày xóa. Trả về số khách sạn bị ảnh hưởng (0 nếu không tìm thấy hoặc đã dừng). */
export async function scheduleDeletion(
  id: string,
  providerProfileId: string,
  deleteAt: Date
): Promise<number> {
  const { count } = await prisma.hotel.updateMany({
    where: { id, providerProfileId, deletedAt: null, deleteScheduledAt: null },
    data: { status: "paused", deleteScheduledAt: deleteAt },
  });
  return count;
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

export async function findPaged(filter: ListFilter) {
  const where: Prisma.HotelWhereInput = {
    status: "published",
    deletedAt: null,
    ...(filter.province && { province: { name: filter.province } }),
    ...(filter.tag && { tags: { some: { tag: { name: filter.tag } } } }),
    ...(filter.q && {
      OR: [
        { name: { contains: filter.q, mode: "insensitive" } },
        { description: { contains: filter.q, mode: "insensitive" } },
      ],
    }),
  };
  const include = { province: true, rooms: true } as const;
  const orderBy = { createdAt: "desc" } as const;

  // giá khách sạn = giá phòng trung bình
  if (needsPriceScan(filter)) {
    const all = await prisma.hotel.findMany({ where, include, orderBy });
    return paginateByPrice(
      all,
      (h) => average(h.rooms.map((r) => Number(r.basePrice))),
      filter,
    );
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
