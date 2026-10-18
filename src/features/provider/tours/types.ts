import { ServiceStatus } from "@/generated/prisma/enums";

export type TourListItem = {
  id: string;
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
  inactive: number;
};
