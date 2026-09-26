import { z } from "zod";

export const roleSchema = z.enum(["customer", "provider", "admin"]);

// Roles a user can select during public self-registration. Deliberately
// excludes "admin" — admin accounts are never created via public sign-up.
export const publicRegisterableRoleSchema = z.enum(["customer", "provider"]);

export const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  phone: z
    .string()
    .trim()
    .regex(/^(\+84|0)\d{9,10}$/, "Số điện thoại không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  fullname: z.string().trim().min(1, "Vui lòng nhập họ tên"),
  role: publicRegisterableRoleSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  role: roleSchema,
});
