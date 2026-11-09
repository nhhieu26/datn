import { z } from "zod";

export const travelModeSchema = z.enum(["car", "motorbike", "walk"]);

/** Body của POST /api/trip-route: lộ trình (chỉ placeId + giờ) cần tính lại quãng đường. */
export const tripRouteSchema = z.object({
  mode: travelModeSchema,
  optimize: z.boolean().default(false),
  itinerary: z.object({
    title: z.string(),
    days: z
      .array(
        z.object({
          date: z.string().optional(),
          start: z.string(),
          end: z.string(),
          stops: z
            .array(
              z.object({
                placeId: z.string(),
                slot: z.enum(["hotel", "breakfast", "lunch", "dinner", "visit"]),
                time: z.string(),
                durationMin: z.number().int().min(0).max(720),
                note: z.string().optional(),
              }),
            )
            .max(25),
        }),
      )
      .min(1)
      .max(7),
  }),
});
