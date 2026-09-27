import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { seedProvinces } from "./seed-province";
import { seedTags } from "./seed-tag";
import { seedUsers } from "./seed-user";
import { seedHotels } from "./seed-hotel";
import { seedRestaurants } from "./seed-restaurant";
import { seedDestinations } from "./seed-destination";

async function main() {
  console.log("Seeding provinces...");
  await seedProvinces();

  console.log("\nSeeding tags...");
  await seedTags();

  console.log("\nSeeding users...");
  await seedUsers();

  console.log("\nSeeding hotels...");
  await seedHotels();

  console.log("\nSeeding restaurants...");
  await seedRestaurants();

  console.log("\nSeeding destinations...");
  await seedDestinations();

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
