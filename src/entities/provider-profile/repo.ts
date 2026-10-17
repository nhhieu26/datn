import { prisma } from "@/lib/prisma";
import type { ApprovalStatus, Prisma } from "@/generated/prisma/client";
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

const approvalWhere = {
  approvalStatus: { in: ["pending", "approved", "rejected"] },
  user: { is: { role: "provider" } },
} satisfies Prisma.ProviderProfileWhereInput;

const approvalSelect = {
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
} satisfies Prisma.ProviderProfileSelect;

export function findAllForApproval() {
  return prisma.providerProfile.findMany({
    where: approvalWhere,
    select: approvalSelect,
    orderBy: { createdAt: "desc" },
  });
}

export function findForApprovalById(id: string) {
  return prisma.providerProfile.findFirst({
    where: { ...approvalWhere, id },
    select: {
      ...approvalSelect,
      payoutEmail: true,
      paypalLinkedAt: true,
      user: {
        select: {
          ...approvalSelect.user.select,
          status: true,
          createdAt: true,
        },
      },
      _count: {
        select: { tours: true, hotels: true, restaurants: true },
      },
    },
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
    payoutEmail: string;
    paypalPayerId: string;
    paypalLinkedAt: Date;
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

export function linkPayPal(
  id: string,
  userId: string,
  input: { email: string; payerId: string }
) {
  return prisma.providerProfile.updateMany({
    where: { id, userId },
    data: {
      payoutEmail: input.email,
      paypalPayerId: input.payerId,
      paypalLinkedAt: new Date(),
    },
  });
}
