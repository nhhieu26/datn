import type { ProviderProfile } from "@/generated/prisma/client";
import type { z } from "zod";
import type {
  businessTypeSchema,
  createProviderProfileSchema,
  updateProviderProfileSchema,
} from "./schema";

export type BusinessType = z.infer<typeof businessTypeSchema>;
export type CreateProviderProfileInput = z.infer<
  typeof createProviderProfileSchema
>;
export type UpdateProviderProfileInput = z.infer<
  typeof updateProviderProfileSchema
>;

export type { ProviderProfile };
