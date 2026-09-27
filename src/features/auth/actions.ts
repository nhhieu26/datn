"use server";

import bcrypt from "bcryptjs";
import { findByEmail, findByPhone, createUser } from "@/entities/user/repo";
import { registerFormSchema } from "./schema";
import { fromZodError, runAction, type ActionState } from "@/shared/lib/action-state";
import { ConflictError, ValidationError } from "@/shared/lib/errors";

export type RegisterActionState = ActionState;

export async function registerAction(
  _prevState: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  return runAction<undefined>(async () => {
    const parsed = registerFormSchema.safeParse({
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      confirm_password: formData.get("confirm_password"),
      fullname: formData.get("fullname"),
      role: formData.get("role"),
    });

    if (!parsed.success) {
      throw new ValidationError(fromZodError(parsed.error));
    }

    const { email, phone, password, fullname, role } = parsed.data;

    const existingUser = await findByEmail(email);
    if (existingUser) {
      throw new ConflictError("Email này đã được sử dụng.");
    }

    const existingPhone = await findByPhone(phone);
    if (existingPhone) {
      throw new ConflictError("Số điện thoại này đã được sử dụng.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await createUser({
      email,
      phone,
      fullname,
      role,
      passwordHash,
    });
  });
}
