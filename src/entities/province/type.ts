import type { Province, ProvinceType } from "@/generated/prisma/client";

export type { Province, ProvinceType };

export type ProvinceWithUsage = Province & {
  _count: {
    tours: number;
    hotels: number;
    restaurants: number;
    destinations: number;
  };
};
