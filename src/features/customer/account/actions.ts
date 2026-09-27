"use server";

import { revalidatePath } from "next/cache";
import { tagRepo } from "@/entities/tag";
import { userRepo } from "@/entities/user";
import { auth } from "@/lib/auth";
import { runAction } from "@/shared/lib/action-state";
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
