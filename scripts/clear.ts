import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Clearing all data...");

  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `;

  if (tables.length > 0) {
    const list = tables.map((t) => `"${t.tablename}"`).join(", ");
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`
    );
  }

  console.log("All data cleared.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
