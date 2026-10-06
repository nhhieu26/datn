import type { BookingStatus } from "@/generated/prisma/enums";

export type RestaurantBookingListItem = {
  id: string;
  code: string;
  restaurantName: string;
  imageUrl: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  reservationDate: string;
  startTime: string;
  endTime: string | null;
  guests: number;
  status: BookingStatus;
  createdAt: string;
};

export type RestaurantBookingDetailView = {
  code: string;
  status: BookingStatus;
  restaurantName: string;
  imageUrl: string;
  provinceName: string | null;
  address: string | null;
  reservationDate: string;
  startTime: string;
  endTime: string | null;
  guests: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  accountName: string;
  note: string | null;
  cancelReason: string | null;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
};

export type RestaurantBookingsSummary = {
  total: number;
  pendingConfirmation: number;
  confirmed: number;
  upcoming: number;
};
