import { prisma } from "@/lib/prisma";
import type { CreateUserInput, PublicUser, User } from "./type";

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
