import type { User } from "@/generated/prisma/client";
import type { z } from "zod";
import type {
  changePasswordSchema,
  createUserSchema,
  loginSchema,
  roleSchema,
  updateProfileSchema,
  userStatusSchema,
} from "./schema";

export type Role = z.infer<typeof roleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export type AdminUserFilter = {
  q?: string;
  role?: Role;
  status?: UserStatus;
};
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type PublicUser = Omit<User, "password">;
export type ProfileUser = Pick<
  User,
  "fullname" | "email" | "phone" | "role" | "createdAt" | "preferences"
>;

export type { User };
