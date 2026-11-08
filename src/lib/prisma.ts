import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Có thời gian chờ để một kết nối/truy vấn bị kẹt báo lỗi thay vì treo vô hạn
// (đã gặp 08/11/2026: 1 trong 18 lệnh ghi song song qua Neon pooler không bao giờ trả về)
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10_000,
  query_timeout: 30_000,
});

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
