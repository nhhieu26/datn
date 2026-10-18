import type { z } from "zod";
import type {
  Prisma,
  Tour,
  TourDeparture,
  TourTag,
} from "@/generated/prisma/client";
import type { createTourSchema, updateTourSchema } from "./schema";

export type { Tour, TourDeparture, TourTag };
export type CreateTourInput = z.infer<typeof createTourSchema>;
export type UpdateTourInput = z.infer<typeof updateTourSchema>;

export type TourWithRelations = Prisma.TourGetPayload<{
  include: {
    province: true;
    tags: { include: { tag: true } };
    departures: true;
  };
}>;

export type TourForProvider = Prisma.TourGetPayload<{
  include: {
    province: true;
    tags: { include: { tag: true } };
    departures: { include: { _count: { select: { bookings: true } } } };
  };
}>;
