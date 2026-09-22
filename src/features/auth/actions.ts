"use server";

import bcrypt from "bcryptjs";
import { findByEmail, createUser } from "@/entities/user/repo";
import { registerFormSchema } from "./schema";

export type RegisterActionState = {
  status: "idle" | "error" | "success";
  formError?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function registerAction(
  _prevState: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  const parsed = registerFormSchema.safeParse({
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
    fullname: formData.get("fullname"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const { email, phone, password, fullname, role } = parsed.data;

  const existingUser = await findByEmail(email);
  if (existingUser) {
    return {
      status: "error",
      formError: "Email này đã được sử dụng.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await createUser({
    email,
    phone,
    fullname,
    role,
    passwordHash,
  });
  return { status: "success" };
}
