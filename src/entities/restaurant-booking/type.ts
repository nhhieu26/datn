import type { BookingStatus, Prisma, RestaurantBooking } from "@/generated/prisma/client";
import type { z } from "zod";
import type { createRestaurantBookingSchema } from "./schema";

export type { RestaurantBooking };
export type CreateRestaurantBookingInput = z.infer<typeof createRestaurantBookingSchema>;

export type RestaurantBookingDetail = Prisma.RestaurantBookingGetPayload<{
  include: {
    restaurant: {
      select: { slug: true; address: true; province: { select: { name: true } } };
    };
    restaurantTimeSlot: { select: { endTime: true } };
  };
}>;

export type RestaurantBookingListItem = Prisma.RestaurantBookingGetPayload<{
  include: {
    restaurant: { select: { images: true } };
    restaurantTimeSlot: { select: { endTime: true } };
  };
}>;

export type RestaurantBookingFilter = {
  q?: string;
  restaurantName?: string;
  status?: BookingStatus;
  createdFrom?: Date;
  createdTo?: Date;
};

export type RestaurantBookingProviderDetail = Prisma.RestaurantBookingGetPayload<{
  include: {
    restaurant: {
      select: {
        images: true;
        address: true;
        province: { select: { name: true } };
      };
    };
    restaurantTimeSlot: { select: { endTime: true } };
    customer: { select: { fullname: true } };
  };
}>;
