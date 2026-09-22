import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { seedProvinces } from "./seed-province";
import { seedTags } from "./seed-tag";

async function main() {
  console.log("Seeding provinces...");
  await seedProvinces();

  console.log("\nSeeding tags...");
  await seedTags();

  console.log("\nAll seeds completed.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
