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
