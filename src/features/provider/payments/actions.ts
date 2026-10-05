"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { providerProfileRepo } from "@/entities/provider-profile";
import { runAction, type ActionState } from "@/shared/lib/action-state";
import {
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
} from "@/shared/lib/errors";

export async function unlinkPayPalAction(
  profileId: string,
  _prev: ActionState,
): Promise<ActionState> {
  return runAction<undefined>(async () => {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthenticatedError();
    if (session.user.role !== "provider") throw new ForbiddenError();

    const { count } = await providerProfileRepo.unlinkPayPal(
      profileId,
      session.user.id,
    );
    if (!count) throw new NotFoundError("Không tìm thấy hồ sơ doanh nghiệp.");

    revalidatePath("/provider/payments");
    return undefined;
  });
}
