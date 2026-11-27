import type { z } from "zod";
import type { operationalSettingsSchema, platformInfoSchema } from "./schema";

export type SystemSettings = {
  commissionRate: number;
  usdRate: number;
  bookingHoldMinutes: number;
  customerCancelCutoffHours: number;
  restaurantCancelCutoffHours: number;
  serviceDeleteGraceDays: number;
  platformName: string;
  tagline: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  aboutVideoUrl: string;
  aboutVideoPosterUrl: string;
  updatedAt: string | null;
};

export type OperationalSettingsInput = z.infer<
  typeof operationalSettingsSchema
>;
export type PlatformInfoInput = z.infer<typeof platformInfoSchema>;
