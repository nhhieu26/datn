import type { z } from "zod";
import type { Hotel, Prisma, Room } from "@/generated/prisma/client";
import type { createHotelSchema, roomDraftSchema } from "./schema";

export type { Hotel, Room };
export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type RoomDraftInput = z.infer<typeof roomDraftSchema>;

export type HotelWithRelations = Prisma.HotelGetPayload<{
  include: {
    province: true;
    tags: { include: { tag: true } };
    rooms: true;
  };
}>;
