import { prisma } from "@/lib/prisma";
import type { Tag, TagWithUsage } from "./type";

export function findAll(): Promise<Tag[]> {
  return prisma.tag.findMany({ orderBy: { name: "asc" } });
}

export function findAllWithUsageCount(): Promise<TagWithUsage[]> {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          tours: true,
          hotels: true,
          restaurants: true,
          destinations: true,
        },
      },
    },
  });
}

export function findById(id: string): Promise<TagWithUsage | null> {
  return prisma.tag.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          tours: true,
          hotels: true,
          restaurants: true,
          destinations: true,
        },
      },
    },
  });
}

export function findByName(name: string): Promise<Tag | null> {
  return prisma.tag.findUnique({ where: { name } });
}

export function findBySlug(slug: string): Promise<Tag | null> {
  return prisma.tag.findUnique({ where: { slug } });
}

export function findManyByIds(ids: string[]): Promise<Tag[]> {
  if (ids.length === 0) return Promise.resolve([]);
  return prisma.tag.findMany({ where: { id: { in: ids } } });
}

export function upsertBySlug(input: {
  name: string;
  slug: string;
}): Promise<Tag> {
  const { slug, ...data } = input;
  return prisma.tag.upsert({
    where: { slug },
    create: { slug, ...data },
    update: data,
  });
}

export function create(input: {
  name: string;
  slug: string;
}): Promise<TagWithUsage> {
  return prisma.tag.create({
    data: input,
    include: {
      _count: {
        select: {
          tours: true,
          hotels: true,
          restaurants: true,
          destinations: true,
        },
      },
    },
  });
}

export function update(
  id: string,
  input: { name: string; slug: string },
): Promise<TagWithUsage> {
  return prisma.tag.update({
    where: { id },
    data: input,
    include: {
      _count: {
        select: {
          tours: true,
          hotels: true,
          restaurants: true,
          destinations: true,
        },
      },
    },
  });
}

export function remove(id: string): Promise<Tag> {
  return prisma.tag.delete({ where: { id } });
}
