import type {
  ApprovalStatus,
  BusinessType,
  UserStatus,
} from "@/generated/prisma/client";

export type ReviewApprovalStatus = Exclude<ApprovalStatus, "not_submitted">;

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
  approvalStatus: ReviewApprovalStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    fullname: string;
    email: string;
    phone: string;
  };
};

export type ApprovalProfileDetail = Omit<ApprovalProfile, "user"> & {
  payoutEmail: string;
  paypalLinkedAt: string;
  serviceCount: number;
  user: ApprovalProfile["user"] & {
    status: UserStatus;
    createdAt: string;
  };
};

export type ApprovalProfilePatch = Pick<
  ApprovalProfile,
  "id" | "approvalStatus" | "rejectionReason" | "updatedAt"
>;

export type ApprovalMutationResult = {
  profiles: ApprovalProfilePatch[];
  updatedCount: number;
};
