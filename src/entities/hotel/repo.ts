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
  HotelWithRelations,
  RoomDraftInput,
  UpdateHotelInput,
} from "./type";

type UploadedImage = { url: string; fileId: string };

export function findBySlug(slug: string): Promise<Hotel | null> {
  return prisma.hotel.findUnique({ where: { slug } });
}

export function findPublishedDetailBySlug(slug: string) {
  return prisma.hotel.findFirst({
    where: { slug, status: "published" },
    include: {
      province: true,
      tags: { include: { tag: true } },
      rooms: { where: { status: "published" }, orderBy: { basePrice: "asc" } },
    },
  });
}

export function findAllByProviderProfileId(
  providerProfileId: string
): Promise<HotelWithRelations[]> {
  return prisma.hotel.findMany({
    where: { providerProfileId },
    include: {
      province: true,
      tags: { include: { tag: true } },
      rooms: true,
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

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "pending_payment",
  "pending_confirmation",
  "paid",
  "confirmed",
];

export function findByIdForProvider(
  id: string,
  providerProfileId: string
): Promise<HotelForProvider | null> {
  return prisma.hotel.findFirst({
    where: { id, providerProfileId },
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

export function findRecent(take: number) {
  return prisma.hotel.findMany({
    where: { status: "published" },
    include: { province: true, rooms: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function findPaged(filter: ListFilter) {
  const where: Prisma.HotelWhereInput = {
    status: "published",
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
