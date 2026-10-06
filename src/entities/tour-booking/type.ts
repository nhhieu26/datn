import type { BookingStatus, Prisma, TourBooking } from "@/generated/prisma/client";
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

export type TourBookingProviderDetail = Prisma.TourBookingGetPayload<{
  include: {
    tourDeparture: {
      include: {
        tour: {
          select: {
            slug: true;
            images: true;
            durationDays: true;
            durationNights: true;
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

export type TourBookingWithPayment = Prisma.TourBookingGetPayload<{
  include: {
    payments: { select: { status: true } };
    refunds: { select: { status: true } };
    tourDeparture: { select: { tour: { select: { images: true } } } };
  };
}>;

export type TourBookingFilter = {
  q?: string;
  tourTitle?: string;
  status?: BookingStatus;
  createdFrom?: Date;
  createdTo?: Date;
};
