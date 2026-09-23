import { prisma } from "@/lib/prisma";
import type { Province, ProvinceType } from "./type";

export function findAll(): Promise<Province[]> {
  return prisma.province.findMany({ orderBy: { name: "asc" } });
}

export function findBySlug(slug: string): Promise<Province | null> {
  return prisma.province.findUnique({ where: { slug } });
}

export function findById(id: string): Promise<Province | null> {
  return prisma.province.findUnique({ where: { id } });
}

export function upsertBySlug(input: {
  name: string;
  fullName: string;
  slug: string;
  type: ProvinceType;
  imageUrl: string | null;
}): Promise<Province> {
  const { slug, ...data } = input;
  return prisma.province.upsert({
    where: { slug },
    create: { slug, ...data },
    update: data,
  });
}
