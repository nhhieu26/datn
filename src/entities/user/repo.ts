import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type {
  AdminUserFilter,
  CreateUserInput,
  ProfileUser,
  PublicUser,
  UpdateProfileInput,
  User,
  UserStatus,
} from "./type";

export function toPublicUser(user: User): PublicUser {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export function findByPhone(phone: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { phone } });
}

export function findProfileById(id: string): Promise<ProfileUser | null> {
  return prisma.user.findUnique({
    where: { id },
    select: {
      fullname: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      preferences: true,
    },
  });
}

export function updatePreferences(
  id: string,
  preferences: Prisma.InputJsonValue
) {
  return prisma.user.update({ where: { id }, data: { preferences } });
}

export function updateProfile(id: string, data: UpdateProfileInput) {
  return prisma.user.update({ where: { id }, data });
}

export async function findPasswordHashById(id: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { password: true },
  });
  return user?.password ?? null;
}

export function updatePassword(id: string, passwordHash: string) {
  return prisma.user.update({ where: { id }, data: { password: passwordHash } });
}

export function createUser(
  input: Omit<CreateUserInput, "password"> & { passwordHash: string }
): Promise<User> {
  return prisma.user.create({
    data: {
      email: input.email,
      phone: input.phone,
      password: input.passwordHash,
      fullname: input.fullname,
      role: input.role,
    },
  });
}

// ----- Quản trị người dùng (admin) -----

function adminWhere(filter: AdminUserFilter): Prisma.UserWhereInput {
  const q = filter.q?.trim();
  return {
    role: filter.role,
    status: filter.status,
    ...(q
      ? {
          OR: [
            { fullname: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        }
      : {}),
  };
}

export function findManyForAdmin(
  filter: AdminUserFilter,
  { skip, take }: { skip: number; take: number }
) {
  return prisma.user.findMany({
    where: adminWhere(filter),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip,
    take,
    select: {
      id: true,
      fullname: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
}

export function countForAdmin(filter: AdminUserFilter) {
  return prisma.user.count({ where: adminWhere(filter) });
}

export async function countSummaryForAdmin() {
  const groups = await prisma.user.groupBy({
    by: ["role", "status"],
    _count: { _all: true },
  });

  const summary = { total: 0, customers: 0, providers: 0, banned: 0 };
  for (const group of groups) {
    const count = group._count._all;
    summary.total += count;
    if (group.role === "customer") summary.customers += count;
    if (group.role === "provider") summary.providers += count;
    if (group.status === "banned") summary.banned += count;
  }
  return summary;
}

export function findDetailForAdmin(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullname: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      onboardingCompleted: true,
      createdAt: true,
      updatedAt: true,
      providerProfiles: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          businessName: true,
          businessType: true,
          approvalStatus: true,
        },
      },
      _count: {
        select: {
          tourBookings: true,
          hotelBookings: true,
          restaurantBookings: true,
          reviews: true,
        },
      },
    },
  });
}

export function findRoleAndStatusById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { role: true, status: true },
  });
}

export async function findStatusById(id: string): Promise<UserStatus | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { status: true },
  });
  return user?.status ?? null;
}

export function updateStatus(id: string, status: UserStatus) {
  return prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  });
}
