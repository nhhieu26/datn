import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { CreateUserInput, ProfileUser, PublicUser, User } from "./type";

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
