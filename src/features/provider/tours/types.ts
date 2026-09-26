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
};

export type ToursSummary = {
  total: number;
  published: number;
  pending: number;
  inactive: number;
};
