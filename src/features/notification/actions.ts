"use server";

import { notificationRepo } from "@/entities/notification";
import { auth } from "@/lib/auth";
import { runAction } from "@/shared/lib/action-state";
import { UnauthenticatedError, ValidationError } from "@/shared/lib/errors";

export async function markNotificationReadAction(id: string) {
  return runAction(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthenticatedError();
    }
    const trimmed = id?.trim();
    if (!trimmed) {
      throw new ValidationError({ id: ["Mã thông báo không hợp lệ."] });
    }
    await notificationRepo.markAsRead(trimmed, session.user.id);
    return { id: trimmed };
  });
}

export async function markAllNotificationsReadAction() {
  return runAction(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthenticatedError();
    }
    const updated = await notificationRepo.markAllAsRead(session.user.id);
    return { updatedCount: updated.count };
  });
}
