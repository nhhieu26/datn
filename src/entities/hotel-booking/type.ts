import type { BookingStatus, HotelBooking, Prisma } from "@/generated/prisma/client";
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

export type HotelBookingWithPayment = Prisma.HotelBookingGetPayload<{
  include: {
    payments: { select: { status: true } };
    refunds: { select: { status: true } };
    room: {
      select: { images: true; hotel: { select: { images: true } } };
    };
  };
}>;

export type HotelBookingFilter = {
  q?: string;
  hotelName?: string;
  status?: BookingStatus;
  createdFrom?: Date;
  createdTo?: Date;
};

export type HotelBookingProviderDetail = Prisma.HotelBookingGetPayload<{
  include: {
    room: {
      select: {
        images: true;
        hotel: {
          select: {
            images: true;
            address: true;
            province: { select: { name: true } };
          };
        };
      };
    };
    customer: { select: { fullname: true } };
    payments: { include: { refunds: true } };
    refunds: true;
    payout: true;
  };
}>;
