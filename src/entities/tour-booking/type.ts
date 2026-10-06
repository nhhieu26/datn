import type { Prisma, TourBooking } from "@/generated/prisma/client";
import type { z } from "zod";
import type { createTourBookingSchema } from "./schema";

export type { TourBooking };
export type CreateTourBookingInput = z.infer<typeof createTourBookingSchema>;

export type TourBookingDetail = Prisma.TourBookingGetPayload<{
  include: {
    tourDeparture: {
      include: { tour: { select: { slug: true; province: true } } };
    };
    payments: true;
  };
}>;
