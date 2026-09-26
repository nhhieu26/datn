import type { z } from "zod";
import type { Prisma, Restaurant } from "@/generated/prisma/client";
import type { createRestaurantSchema } from "./schema";

export type { Restaurant };
export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;

export type RestaurantWithRelations = Prisma.RestaurantGetPayload<{
  include: {
    province: true;
    tags: { include: { tag: true } };
    timeSlots: true;
  };
}>;
