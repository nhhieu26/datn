import type { Tag } from "@/generated/prisma/client";

export type { Tag };

export type TagWithUsage = Tag & {
  _count: {
    tours: number;
    hotels: number;
    restaurants: number;
    destinations: number;
  };
};
