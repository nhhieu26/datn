import { prisma } from "@/lib/prisma";
import type { BusinessType, CreateProviderProfileInput, ProviderProfile } from "./type";

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

export function create(
  input: CreateProviderProfileInput & { userId: string; photoUrl: string | null }
): Promise<ProviderProfile> {
  const { licenseUrl, website, photoUrl, ...rest } = input;
  return prisma.providerProfile.create({
    data: {
      ...rest,
      licenseUrl: licenseUrl || null,
      website: website || null,
      photoUrl,
      approvalStatus: "pending",
    },
  });
}
