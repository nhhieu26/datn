import type { z } from "zod";
import type {
  Prisma,
  Tour,
  TourDeparture,
  TourTag,
} from "@/generated/prisma/client";
import type { createTourSchema } from "./schema";

export type { Tour, TourDeparture, TourTag };
export type CreateTourInput = z.infer<typeof createTourSchema>;

export type TourWithRelations = Prisma.TourGetPayload<{
  include: {
    province: true;
    tags: { include: { tag: true } };
    departures: true;
  };
}>;
