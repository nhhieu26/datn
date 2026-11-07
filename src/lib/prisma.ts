import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Dev: client cache trong globalThis có thể được tạo trước lần `prisma generate` mới nhất
// → thiếu model mới (vd: prisma.trip undefined). Kiểm tra đủ delegate cho mọi model hiện tại.
function hasAllModels(client: PrismaClient): boolean {
  return Object.values(Prisma.ModelName).every(
    (name) => (client as unknown as Record<string, unknown>)[name.charAt(0).toLowerCase() + name.slice(1)] != null,
  );
}

function getClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (cached && hasAllModels(cached)) return cached;
  if (cached) void cached.$disconnect().catch(() => {});
  return new PrismaClient({ adapter });
}

export const prisma = getClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
