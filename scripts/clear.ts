import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Clearing all data...");

  await prisma.$transaction(
    [
      prisma.tourTag.deleteMany(),
      prisma.tourDeparture.deleteMany(),
      prisma.tour.deleteMany(),
      prisma.tag.deleteMany(),
      prisma.providerProfile.deleteMany(),
      prisma.user.deleteMany(),
      prisma.province.deleteMany(),
    ],
    // ponytail: Neon scale-to-zero cold starts exceed Prisma's default 2s maxWait (P2028)
    { maxWait: 15_000, timeout: 60_000 }
  );

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
