import { ServiceStatus } from "@/generated/prisma/enums";

export type HotelListItem = {
  id: string;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  provinceName: string;
  address: string;
  roomCount: number;
  totalRoomQuantity: number;
  lowestRoomPrice: number | null;
  averageRoomPrice: number | null;
  tagNames: string[];
  totalBookings: number;
  rating: number | null;
  reviewCount: number;
  status: ServiceStatus;
};

export type HotelsSummary = {
  total: number;
  published: number;
  pending: number;
  inactive: number;
};
