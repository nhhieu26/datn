
-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "ratingAvg" DECIMAL(2,1) NOT NULL DEFAULT 0,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "ratingAvg" DECIMAL(2,1) NOT NULL DEFAULT 0,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "ratingAvg" DECIMAL(2,1) NOT NULL DEFAULT 0,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "tourId" TEXT,
    "hotelId" TEXT,
    "restaurantId" TEXT,
    "tourBookingId" TEXT,
    "hotelBookingId" TEXT,
    "restaurantBookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_tourBookingId_key" ON "Review"("tourBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_hotelBookingId_key" ON "Review"("hotelBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_restaurantBookingId_key" ON "Review"("restaurantBookingId");

-- CreateIndex
CREATE INDEX "Review_tourId_createdAt_idx" ON "Review"("tourId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_hotelId_createdAt_idx" ON "Review"("hotelId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_restaurantId_createdAt_idx" ON "Review"("restaurantId", "createdAt");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_tourBookingId_fkey" FOREIGN KEY ("tourBookingId") REFERENCES "TourBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_hotelBookingId_fkey" FOREIGN KEY ("hotelBookingId") REFERENCES "HotelBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_restaurantBookingId_fkey" FOREIGN KEY ("restaurantBookingId") REFERENCES "RestaurantBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Review thuộc đúng 1 dịch vụ, rating 1..5
ALTER TABLE "Review" ADD CONSTRAINT "Review_service_check" CHECK (num_nonnulls("tourId", "hotelId", "restaurantId") = 1);
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_check" CHECK ("rating" BETWEEN 1 AND 5);
