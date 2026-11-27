"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { userRepo, type UserStatus } from "@/entities/user";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/shared/lib/errors";
import {
  fromZodError,
  runAction,
  type ActionState,
} from "@/shared/lib/action-state";
import { requireAdmin } from "@/shared/lib/require-admin";
import type { UserStatusMutationResult } from "./types";

const userIdSchema = z.object({ id: z.string().trim().min(1) });

async function setUserStatus(
  id: string,
  nextStatus: Extract<UserStatus, "active" | "banned">,
): Promise<ActionState<UserStatusMutationResult>> {
  const result = await runAction<UserStatusMutationResult>(async () => {
    const session = await requireAdmin();

    const parsed = userIdSchema.safeParse({ id });
    if (!parsed.success) {
      throw new ValidationError(fromZodError(parsed.error));
    }
    const userId = parsed.data.id;

    if (userId === session.user.id) {
      throw new ConflictError(
        "Bạn không thể thay đổi trạng thái tài khoản của chính mình.",
      );
    }

    const user = await userRepo.findRoleAndStatusById(userId);
    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng.");
    }
    if (user.role === "admin") {
      throw new ConflictError(
        "Không thể khoá hoặc mở khoá tài khoản quản trị viên.",
      );
    }
    if (nextStatus === "banned" && user.status === "banned") {
      throw new ConflictError("Tài khoản này đã bị khoá.");
    }
    if (nextStatus === "active" && user.status !== "banned") {
      throw new ConflictError("Tài khoản này không ở trạng thái bị khoá.");
    }

    return userRepo.updateStatus(userId, nextStatus);
  });

  if (result.status === "success") {
    revalidatePath("/admin/users");
    revalidatePath("/admin/users/[id]", "page");
    revalidatePath("/admin/profile-approval/[id]", "page");
  }
  return result;
}

export async function banUserAction(
  id: string,
): Promise<ActionState<UserStatusMutationResult>> {
  return setUserStatus(id, "banned");
}

export async function unbanUserAction(
  id: string,
): Promise<ActionState<UserStatusMutationResult>> {
  return setUserStatus(id, "active");
}
