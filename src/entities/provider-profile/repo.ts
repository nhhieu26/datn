import { prisma } from "@/lib/prisma";
import type { ApprovalStatus } from "@/generated/prisma/client";
import type {
  BusinessType,
  CreateProviderProfileInput,
  ProviderProfile,
  UpdateProviderProfileInput,
} from "./type";

export async function findBusinessTypesByUserId(
  userId: string
): Promise<BusinessType[]> {
  const rows = await prisma.providerProfile.findMany({
    where: { userId },
    select: { businessType: true },
  });
  return rows.map((row) => row.businessType);
}

export function findAllByUserId(userId: string): Promise<ProviderProfile[]> {
  return prisma.providerProfile.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export function findAllForApproval() {
  return prisma.providerProfile.findMany({
    where: {
      approvalStatus: { in: ["pending", "approved", "rejected"] },
      user: { is: { role: "provider" } },
    },
    select: {
      id: true,
      userId: true,
      businessName: true,
      businessType: true,
      taxCode: true,
      licenseUrl: true,
      website: true,
      address: true,
      description: true,
      photoUrl: true,
      approvalStatus: true,
      rejectionReason: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          fullname: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function findApprovalStatesByIds(ids: string[]) {
  return prisma.providerProfile.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      approvalStatus: true,
      rejectionReason: true,
      updatedAt: true,
    },
  });
}

export function approvePendingByIds(ids: string[]) {
  return prisma.providerProfile.updateMany({
    where: {
      id: { in: ids },
      approvalStatus: "pending",
    },
    data: {
      approvalStatus: "approved",
      rejectionReason: null,
    },
  });
}

export function rejectPendingById(id: string, rejectionReason: string) {
  return prisma.providerProfile.updateMany({
    where: {
      id,
      approvalStatus: "pending",
    },
    data: {
      approvalStatus: "rejected",
      rejectionReason,
    },
  });
}

export function findApprovedByUserIdAndBusinessType(
  userId: string,
  businessType: BusinessType
): Promise<ProviderProfile | null> {
  return prisma.providerProfile.findFirst({
    where: {
      userId,
      businessType,
      approvalStatus: "approved",
      user: { is: { role: "provider", status: "active" } },
    },
  });
}

export function create(
  input: CreateProviderProfileInput & {
    userId: string;
    photoUrl: string | null;
    photoFileId: string | null;
  }
): Promise<ProviderProfile> {
  const { licenseUrl, website, photoUrl, photoFileId, ...rest } = input;
  return prisma.providerProfile.create({
    data: {
      ...rest,
      licenseUrl: licenseUrl || null,
      website: website || null,
      photoUrl,
      photoFileId,
      approvalStatus: "pending",
    },
  });
}

export function findById(
  id: string,
  userId: string
): Promise<ProviderProfile | null> {
  return prisma.providerProfile.findFirst({ where: { id, userId } });
}

export function update(
  id: string,
  input: UpdateProviderProfileInput & {
    photoUrl: string | null;
    photoFileId: string | null;
    approvalStatus: ApprovalStatus;
    rejectionReason: string | null;
  }
): Promise<ProviderProfile> {
  const { licenseUrl, website, ...rest } = input;
  return prisma.providerProfile.update({
    where: { id },
    data: {
      ...rest,
      licenseUrl: licenseUrl || null,
      website: website || null,
    },
  });
}
