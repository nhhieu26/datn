import type { Role, UserStatus } from "@/entities/user";
import type {
  ApprovalStatus,
  BookingStatus,
  BusinessType,
} from "@/generated/prisma/client";

export type AdminUserRow = {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
};

export type AdminUsersSummary = {
  total: number;
  customers: number;
  providers: number;
  banned: number;
};

export type AdminUserBooking = {
  id: string;
  type: BusinessType;
  code: string;
  title: string;
  serviceDate: string;
  guests: number;
  status: BookingStatus;
  totalAmount: number | null;
  customerName: string;
  providerName: string;
  createdAt: string;
};

export type AdminUserDetail = AdminUserRow & {
  recentBookings: AdminUserBooking[];
  onboardingCompleted: boolean;
  updatedAt: string;
  providerProfiles: {
    id: string;
    businessName: string;
    businessType: BusinessType;
    approvalStatus: ApprovalStatus;
  }[];
  counts: {
    tourBookings: number;
    hotelBookings: number;
    restaurantBookings: number;
    reviews: number;
  };
};

export type UserStatusMutationResult = {
  id: string;
  status: UserStatus;
};
