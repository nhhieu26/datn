import type { z } from "zod";
import type {
  Tour,
  TourDeparture,
  TourTag,
} from "@/generated/prisma/client";
import type { createTourSchema } from "./schema";

export type { Tour, TourDeparture, TourTag };
export type CreateTourInput = z.infer<typeof createTourSchema>;
