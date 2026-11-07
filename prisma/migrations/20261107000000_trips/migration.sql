-- CreateEnum
CREATE TYPE "TripStopSource" AS ENUM ('internal', 'external');

-- CreateEnum
CREATE TYPE "TripStopKind" AS ENUM ('hotel', 'restaurant', 'destination');

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "province" TEXT,
    "dayCount" INTEGER NOT NULL DEFAULT 1,
    "routes" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripStop" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "source" "TripStopSource" NOT NULL,
    "kind" "TripStopKind" NOT NULL,
    "refId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "image" TEXT,
    "url" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripStop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trip_userId_idx" ON "Trip"("userId");

-- CreateIndex
CREATE INDEX "TripStop_tripId_day_idx" ON "TripStop"("tripId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "TripStop_tripId_source_refId_key" ON "TripStop"("tripId", "source", "refId");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripStop" ADD CONSTRAINT "TripStop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
