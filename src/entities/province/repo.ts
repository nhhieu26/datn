import { prisma } from "@/lib/prisma";
import type { Province, ProvinceType, ProvinceWithUsage } from "./type";

export function findAll(): Promise<Province[]> {
  return prisma.province.findMany({ orderBy: { name: "asc" } });
}

export function findAllWithUsageCount(): Promise<ProvinceWithUsage[]> {
  return prisma.province.findMany({
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

export function findBySlug(slug: string): Promise<Province | null> {
  return prisma.province.findUnique({ where: { slug } });
}

export function findByName(name: string): Promise<Province | null> {
  return prisma.province.findUnique({ where: { name } });
}

export function findById(id: string): Promise<Province | null> {
  return prisma.province.findUnique({ where: { id } });
}

export function findByIdWithUsageCount(
  id: string,
): Promise<ProvinceWithUsage | null> {
  return prisma.province.findUnique({
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

export function create(input: {
  name: string;
  fullName: string;
  slug: string;
  type: ProvinceType;
  imageUrl: string | null;
}): Promise<ProvinceWithUsage> {
  return prisma.province.create({
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
  input: {
    name: string;
    fullName: string;
    slug: string;
    type: ProvinceType;
    imageUrl: string | null;
  },
): Promise<ProvinceWithUsage> {
  return prisma.province.update({
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

export function remove(id: string): Promise<Province> {
  return prisma.province.delete({ where: { id } });
}
