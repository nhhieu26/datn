import { prisma } from "@/lib/prisma";
import type {
  Hotel,
  HotelWithRelations,
  RoomDraftInput,
} from "./type";

type UploadedImage = { url: string; fileId: string };

export function findBySlug(slug: string): Promise<Hotel | null> {
  return prisma.hotel.findUnique({ where: { slug } });
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
