import { ServiceStatus } from "@/generated/prisma/enums";

export type TourListItem = {
  id: string;
  slug: string;
  code: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  provinceName: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  nearestDepartureDate: string | null;
  totalBookings: number;
  rating: number | null;
  reviewCount: number;
  status: ServiceStatus;
  deleteScheduledAt: string | null;
  activeBookings: number;
};

export type ToursSummary = {
  total: number;
  published: number;
  /** Tạm dừng thủ công, không tính dịch vụ đang chờ xóa. */
  paused: number;
  pendingDeletion: number;
};
