import type {
  Notification as PrismaNotification,
  NotificationType,
  Prisma,
} from "@/generated/prisma/client";

export type { NotificationType };
export type Notification = PrismaNotification;

export type NotificationFilter = "all" | "unread";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  href?: string | null;
  metadata?: Prisma.InputJsonValue;
};
