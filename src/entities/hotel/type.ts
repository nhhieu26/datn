import type { z } from "zod";
import type { Hotel, Prisma, Room } from "@/generated/prisma/client";
import type {
  createHotelSchema,
  roomDraftSchema,
  updateHotelSchema,
} from "./schema";

export type { Hotel, Room };
export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>;
export type RoomDraftInput = z.infer<typeof roomDraftSchema>;

export type HotelWithRelations = Prisma.HotelGetPayload<{
  include: {
    province: true;
    tags: { include: { tag: true } };
    rooms: true;
  };
}>;

export type HotelForProvider = Prisma.HotelGetPayload<{
  include: {
    province: true;
    tags: { include: { tag: true } };
    rooms: { include: { _count: { select: { bookings: true } } } };
  };
}>;

export type HotelForProviderList = Prisma.HotelGetPayload<{
  include: {
    province: true;
    tags: { include: { tag: true } };
    rooms: {
      include: {
        _count: { select: { bookings: true } };
        bookings: { select: { id: true } };
      };
    };
  };
}>;
