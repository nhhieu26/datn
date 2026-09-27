import { prisma } from "@/lib/prisma";
import type {
  CreateDestinationInput,
  Destination,
  DestinationWithRelations,
} from "./type";

export function findBySlug(slug: string): Promise<Destination | null> {
  return prisma.destination.findUnique({ where: { slug } });
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
