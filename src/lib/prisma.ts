import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  // Mặc định pg chờ kết nối vô hạn: Neon ngắt kết nối/đang thức dậy làm request treo hàng phút
  connectionTimeoutMillis: 10_000,
  // Đóng kết nối rảnh trước khi Neon tự ngắt để pool không giữ kết nối đã chết
  idleTimeoutMillis: 30_000,
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
