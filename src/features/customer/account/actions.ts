"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { tagRepo } from "@/entities/tag";
import {
  changePasswordSchema,
  updateProfileSchema,
  userRepo,
} from "@/entities/user";
import { auth } from "@/lib/auth";
import {
  fromZodError,
  runAction,
  type ActionState,
} from "@/shared/lib/action-state";
import {
  ForbiddenError,
  UnauthenticatedError,
  ValidationError,
} from "@/shared/lib/errors";

export async function saveInterestsAction(formData: FormData) {
  return runAction(async () => {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthenticatedError();
    if (session.user.role !== "customer") throw new ForbiddenError();

    const submitted = formData.getAll("tags");
    const tags = await tagRepo.findAll();
    if (
      submitted.some(
        (name) =>
          typeof name !== "string" || !tags.some((tag) => tag.name === name),
      )
    ) {
      throw new ValidationError({ tags: ["Sở thích không hợp lệ."] });
    }

    const user = await userRepo.findProfileById(session.user.id);
    if (!user) throw new UnauthenticatedError();
    const existing = user.preferences;
    await userRepo.updatePreferences(session.user.id, {
      ...(existing && typeof existing === "object" && !Array.isArray(existing)
        ? existing
        : {}),
      tags: [...new Set(submitted as string[])],
    });
    revalidatePath("/profile");
  });
}

async function requireCustomerId() {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthenticatedError();
  if (session.user.role !== "customer") throw new ForbiddenError();
  return session.user.id;
}

export async function updateProfileAction(
  _prevState: ActionState<void>,
  formData: FormData,
): Promise<ActionState<void>> {
  return runAction(async () => {
    const userId = await requireCustomerId();

    const parsed = updateProfileSchema.safeParse({
      fullname: formData.get("fullname"),
      email: formData.get("email"),
      phone: formData.get("phone"),
    });
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));

    const [emailOwner, phoneOwner] = await Promise.all([
      userRepo.findByEmail(parsed.data.email),
      userRepo.findByPhone(parsed.data.phone),
    ]);
    const fieldErrors: Record<string, string[]> = {};
    if (emailOwner && emailOwner.id !== userId) {
      fieldErrors.email = ["Email đã được sử dụng."];
    }
    if (phoneOwner && phoneOwner.id !== userId) {
      fieldErrors.phone = ["Số điện thoại đã được sử dụng."];
    }
    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidationError(fieldErrors);
    }

    await userRepo.updateProfile(userId, parsed.data);
    revalidatePath("/profile");
  });
}

export async function changePasswordAction(
  _prevState: ActionState<void>,
  formData: FormData,
): Promise<ActionState<void>> {
  return runAction(async () => {
    const userId = await requireCustomerId();

    const parsed = changePasswordSchema.safeParse({
      current_password: formData.get("current_password"),
      new_password: formData.get("new_password"),
      confirm_password: formData.get("confirm_password"),
    });
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));

    const hash = await userRepo.findPasswordHashById(userId);
    if (!hash) throw new UnauthenticatedError();
    if (!(await bcrypt.compare(parsed.data.current_password, hash))) {
      throw new ValidationError({
        current_password: ["Mật khẩu cũ không đúng"],
      });
    }

    await userRepo.updatePassword(
      userId,
      await bcrypt.hash(parsed.data.new_password, 10),
    );
  });
}
