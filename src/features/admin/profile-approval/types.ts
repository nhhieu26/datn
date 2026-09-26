import type {
  ApprovalStatus,
  BusinessType,
} from "@/generated/prisma/client";

export type ApprovalProfile = {
  id: string;
  userId: string;
  businessName: string;
  businessType: BusinessType;
  taxCode: string | null;
  licenseUrl: string | null;
  website: string | null;
  address: string | null;
  description: string | null;
  photoUrl: string | null;
  approvalStatus: ApprovalStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    fullname: string;
    email: string;
    phone: string;
  };
};
