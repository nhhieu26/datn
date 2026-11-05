-- CreateEnum
CREATE TYPE "ExternalPlaceKind" AS ENUM ('hotel', 'restaurant', 'destination');

-- CreateTable
CREATE TABLE "ExternalPlace" (
    "id" TEXT NOT NULL,
    "osmType" TEXT NOT NULL,
    "osmId" TEXT NOT NULL,
    "kind" "ExternalPlaceKind" NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "province" TEXT,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "extra" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalPlaceSearch" (
    "id" TEXT NOT NULL,
    "queryKey" TEXT NOT NULL,
    "placeIds" TEXT[],
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalPlaceSearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalPlace_osmType_osmId_key" ON "ExternalPlace"("osmType", "osmId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalPlaceSearch_queryKey_key" ON "ExternalPlaceSearch"("queryKey");
