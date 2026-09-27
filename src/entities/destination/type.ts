import type { z } from "zod";
import type {
  Destination,
  DestinationTag,
  Prisma,
} from "@/generated/prisma/client";
import type { createDestinationSchema } from "./schema";

export type { Destination, DestinationTag };
export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;

export type DestinationWithRelations = Prisma.DestinationGetPayload<{
  include: {
    province: true;
    tags: { include: { tag: true } };
  };
}>;
