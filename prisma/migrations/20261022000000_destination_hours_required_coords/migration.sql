-- AlterTable
ALTER TABLE "Destination" ADD COLUMN "openTime" TEXT NOT NULL DEFAULT '08:00',
ADD COLUMN "closeTime" TEXT NOT NULL DEFAULT '17:00';
ALTER TABLE "Destination" ALTER COLUMN "openTime" DROP DEFAULT,
ALTER COLUMN "closeTime" DROP DEFAULT;

-- Coordinates become required (fails if any row still has NULL)
ALTER TABLE "Destination" ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL;
ALTER TABLE "Hotel" ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL;
ALTER TABLE "Restaurant" ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL;
