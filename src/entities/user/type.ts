import type { User } from "@/generated/prisma/client";
import type { z } from "zod";
import type { createUserSchema, loginSchema, roleSchema } from "./schema";

export type Role = z.infer<typeof roleSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type PublicUser = Omit<User, "password">;

export type { User };
