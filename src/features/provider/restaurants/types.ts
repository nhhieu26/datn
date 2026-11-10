import type { ServiceStatus } from "@/generated/prisma/enums";

export type RestaurantListItem = {
  id: string;
  slug: string;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  provinceName: string;
  address: string;
  capacity: number;
  menuItemCount: number;
  lowestMenuPrice: number | null;
  tagNames: string[];
  totalBookings: number;
  status: ServiceStatus;
  deleteScheduledAt: string | null;
  activeBookings: number;
};

export type RestaurantsSummary = {
  total: number;
  published: number;
  /** Tạm dừng thủ công, không tính dịch vụ đang chờ xóa. */
  paused: number;
  pendingDeletion: number;
};
