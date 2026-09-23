import { prisma } from "@/lib/prisma";
import type { Tag } from "./type";

export function findAll(): Promise<Tag[]> {
  return prisma.tag.findMany({ orderBy: { name: "asc" } });
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
