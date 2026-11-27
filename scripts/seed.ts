import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { seedProvinces } from "./seed-province";
import { seedTags } from "./seed-tag";
import { seedUsers } from "./seed-user";
import { seedHotels } from "./seed-hotel";
import { seedRestaurants } from "./seed-restaurant";
import { seedDestinations } from "./seed-destination";
import { seedTours } from "./seed-tour";
import { seedBookings } from "./seed-booking";
import { seedReviews } from "./seed-review";
import { seedNotifications } from "./seed-notification";
import { seedArticles } from "./seed-article";

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

  console.log("\nSeeding tours...");
  await seedTours();

  console.log("\nSeeding bookings...");
  await seedBookings();

  console.log("\nSeeding reviews...");
  await seedReviews();

  console.log("\nSeeding notifications...");
  await seedNotifications();

  console.log("\nSeeding articles...");
  await seedArticles();

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
