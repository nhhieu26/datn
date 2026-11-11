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

export function findDetailById(id: string, userId: string) {
  return prisma.providerProfile.findFirst({
    where: { id, userId },
    include: {
      _count: { select: { tours: true, hotels: true, restaurants: true } },
    },
  });
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

/**
 * Xóa hồ sơ nếu không còn dịch vụ (chưa xóa mềm), booking hay payout nào.
 * Kiểm tra và xóa trong một câu lệnh. Trả về 0 nếu không tìm thấy hoặc còn ràng buộc.
 */
export async function removeIfUnused(
  id: string,
  userId: string
): Promise<number> {
  const { count } = await prisma.providerProfile.deleteMany({
    where: {
      id,
      userId,
      tours: { none: { deletedAt: null } },
      hotels: { none: { deletedAt: null } },
      restaurants: { none: { deletedAt: null } },
      tourBookings: { none: {} },
      hotelBookings: { none: {} },
      restaurantBookings: { none: {} },
      payouts: { none: {} },
    },
  });
  return count;
}

/** Đếm những thứ đang chặn việc xóa hồ sơ, để báo lý do cho provider. */
export async function findDeletionBlockers(id: string, userId: string) {
  const profile = await prisma.providerProfile.findFirst({
    where: { id, userId },
    select: {
      _count: {
        select: {
          tours: { where: { deletedAt: null } },
          hotels: { where: { deletedAt: null } },
          restaurants: { where: { deletedAt: null } },
          tourBookings: true,
          hotelBookings: true,
          restaurantBookings: true,
          payouts: true,
        },
      },
    },
  });
  if (!profile) return null;

  const count = profile._count;
  return {
    services: count.tours + count.hotels + count.restaurants,
    transactions:
      count.tourBookings +
      count.hotelBookings +
      count.restaurantBookings +
      count.payouts,
  };
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

/** Số hồ sơ đối tác theo trạng thái duyệt (báo cáo admin). */
export async function countByApprovalStatus() {
  const rows = await prisma.providerProfile.groupBy({
    by: ["approvalStatus"],
    _count: { _all: true },
  });
  const counts: Record<ApprovalStatus, number> = {
    not_submitted: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };
  for (const row of rows) counts[row.approvalStatus] = row._count._all;
  return counts;
}

export function findNamesByIds(ids: string[]) {
  return prisma.providerProfile.findMany({
    where: { id: { in: ids } },
    select: { id: true, businessName: true, businessType: true },
  });
}
