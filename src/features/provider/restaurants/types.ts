import type { ServiceStatus } from "@/generated/prisma/enums";

export type RestaurantListItem = {
  id: string;
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
  status: ServiceStatus;
};

export type RestaurantsSummary = {
  total: number;
  published: number;
  pending: number;
  inactive: number;
};
