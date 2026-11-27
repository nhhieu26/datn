import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateNotificationInput,
  NotificationFilter,
  NotificationItem,
} from "./type";

function toItem(row: {
  id: string;
  type: NotificationItem["type"];
  title: string;
  message: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
  metadata: Prisma.JsonValue;
}): NotificationItem {
  const metadata =
    row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : {};
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    href: row.href,
    readAt: row.readAt ? row.readAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    metadata,
  };
}

export function create(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      href: input.href ?? null,
      metadata: input.metadata ?? {},
    },
  });
}

export function createMany(inputs: CreateNotificationInput[]) {
  if (inputs.length === 0) return Promise.resolve({ count: 0 });
  return prisma.notification.createMany({
    data: inputs.map((input) => ({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      href: input.href ?? null,
      metadata: input.metadata ?? {},
    })),
  });
}

/** Gửi thông báo tới toàn bộ tài khoản quản trị viên đang hoạt động. */
export async function notifyAdmins(
  input: Omit<CreateNotificationInput, "userId">
) {
  const admins = await prisma.user.findMany({
    where: { role: "admin", status: "active" },
    select: { id: true },
  });
  if (admins.length === 0) return { count: 0 };
  return createMany(
    admins.map((admin) => ({
      ...input,
      userId: admin.id,
    }))
  );
}

/** Danh sách thông báo gần nhất của người dùng kèm tổng số chưa đọc. */
export async function findRecentByUserId(
  userId: string,
  options?: { filter?: NotificationFilter; take?: number }
): Promise<{ items: NotificationItem[]; unreadCount: number }> {
  const take = Math.min(Math.max(options?.take ?? 20, 1), 50);
  const unreadOnly = options?.filter === "unread";

  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
    }),
    prisma.notification.count({
      where: { userId, readAt: null },
    }),
  ]);

  return {
    items: rows.map(toItem),
    unreadCount,
  };
}

export function countUnreadByUserId(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export function markAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
