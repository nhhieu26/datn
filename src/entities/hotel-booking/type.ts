import type { HotelBooking, Prisma } from "@/generated/prisma/client";
import type { z } from "zod";
import type { createHotelBookingSchema } from "./schema";

export type { HotelBooking };
export type CreateHotelBookingInput = z.infer<typeof createHotelBookingSchema>;

export type HotelBookingDetail = Prisma.HotelBookingGetPayload<{
  include: {
    room: {
      include: { hotel: { select: { slug: true; province: true } } };
    };
    payments: true;
  };
}>;
