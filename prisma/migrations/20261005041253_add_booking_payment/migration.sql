-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending_payment', 'confirmed', 'completed', 'cancelled', 'expired', 'no_show');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('paypal');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'processing', 'succeeded', 'failed');

-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN     "payoutEmail" TEXT;

-- CreateTable
CREATE TABLE "TourBooking" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "providerProfileId" TEXT NOT NULL,
    "tourDepartureId" TEXT,
    "tourTitle" TEXT NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "adults" INTEGER NOT NULL,
    "children" INTEGER NOT NULL DEFAULT 0,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending_payment',
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "note" TEXT,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "commissionRate" DECIMAL(5,4) NOT NULL,
    "platformFee" DECIMAL(12,2) NOT NULL,
    "providerAmount" DECIMAL(12,2) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelBooking" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "providerProfileId" TEXT NOT NULL,
    "roomId" TEXT,
    "hotelName" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3) NOT NULL,
    "nights" INTEGER NOT NULL,
    "roomQuantity" INTEGER NOT NULL,
    "guests" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending_payment',
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "note" TEXT,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "commissionRate" DECIMAL(5,4) NOT NULL,
    "platformFee" DECIMAL(12,2) NOT NULL,
    "providerAmount" DECIMAL(12,2) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantBooking" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "providerProfileId" TEXT NOT NULL,
    "restaurantId" TEXT,
    "restaurantTimeSlotId" TEXT,
    "restaurantName" TEXT NOT NULL,
    "reservationDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'confirmed',
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "note" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "tourBookingId" TEXT,
    "hotelBookingId" TEXT,
    "gateway" "PaymentGateway" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(12,2) NOT NULL,
    "chargedAmount" DECIMAL(12,2) NOT NULL,
    "chargedCurrency" TEXT NOT NULL,
    "exchangeRate" DECIMAL(18,6),
    "gatewayOrderId" TEXT NOT NULL,
    "gatewayCaptureId" TEXT,
    "paidAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "tourBookingId" TEXT,
    "hotelBookingId" TEXT,
    "paymentId" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(12,2) NOT NULL,
    "chargedAmount" DECIMAL(12,2) NOT NULL,
    "chargedCurrency" TEXT NOT NULL,
    "gatewayRefundId" TEXT,
    "reason" TEXT,
    "processedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "tourBookingId" TEXT,
    "hotelBookingId" TEXT,
    "providerProfileId" TEXT NOT NULL,
    "gateway" "PaymentGateway" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(12,2) NOT NULL,
    "chargedAmount" DECIMAL(12,2) NOT NULL,
    "chargedCurrency" TEXT NOT NULL,
    "exchangeRate" DECIMAL(18,6),
    "receiver" TEXT NOT NULL,
    "gatewayBatchId" TEXT,
    "gatewayItemId" TEXT,
    "paidAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TourBooking_code_key" ON "TourBooking"("code");

-- CreateIndex
CREATE INDEX "TourBooking_customerId_idx" ON "TourBooking"("customerId");

-- CreateIndex
CREATE INDEX "TourBooking_providerProfileId_status_idx" ON "TourBooking"("providerProfileId", "status");

-- CreateIndex
CREATE INDEX "TourBooking_status_departureDate_idx" ON "TourBooking"("status", "departureDate");

-- CreateIndex
CREATE UNIQUE INDEX "HotelBooking_code_key" ON "HotelBooking"("code");

-- CreateIndex
CREATE INDEX "HotelBooking_roomId_checkInDate_checkOutDate_idx" ON "HotelBooking"("roomId", "checkInDate", "checkOutDate");

-- CreateIndex
CREATE INDEX "HotelBooking_customerId_idx" ON "HotelBooking"("customerId");

-- CreateIndex
CREATE INDEX "HotelBooking_providerProfileId_status_idx" ON "HotelBooking"("providerProfileId", "status");

-- CreateIndex
CREATE INDEX "HotelBooking_status_checkOutDate_idx" ON "HotelBooking"("status", "checkOutDate");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantBooking_code_key" ON "RestaurantBooking"("code");

-- CreateIndex
CREATE INDEX "RestaurantBooking_restaurantId_reservationDate_idx" ON "RestaurantBooking"("restaurantId", "reservationDate");

-- CreateIndex
CREATE INDEX "RestaurantBooking_customerId_idx" ON "RestaurantBooking"("customerId");

-- CreateIndex
CREATE INDEX "RestaurantBooking_providerProfileId_status_idx" ON "RestaurantBooking"("providerProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_gatewayOrderId_key" ON "Payment"("gatewayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_gatewayCaptureId_key" ON "Payment"("gatewayCaptureId");

-- CreateIndex
CREATE INDEX "Payment_tourBookingId_idx" ON "Payment"("tourBookingId");

-- CreateIndex
CREATE INDEX "Payment_hotelBookingId_idx" ON "Payment"("hotelBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_gatewayRefundId_key" ON "Refund"("gatewayRefundId");

-- CreateIndex
CREATE INDEX "Refund_tourBookingId_idx" ON "Refund"("tourBookingId");

-- CreateIndex
CREATE INDEX "Refund_hotelBookingId_idx" ON "Refund"("hotelBookingId");

-- CreateIndex
CREATE INDEX "Refund_paymentId_idx" ON "Refund"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_tourBookingId_key" ON "Payout"("tourBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_hotelBookingId_key" ON "Payout"("hotelBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_gatewayItemId_key" ON "Payout"("gatewayItemId");

-- CreateIndex
CREATE INDEX "Payout_providerProfileId_status_idx" ON "Payout"("providerProfileId", "status");

-- AddForeignKey
ALTER TABLE "TourBooking" ADD CONSTRAINT "TourBooking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourBooking" ADD CONSTRAINT "TourBooking_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourBooking" ADD CONSTRAINT "TourBooking_tourDepartureId_fkey" FOREIGN KEY ("tourDepartureId") REFERENCES "TourDeparture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelBooking" ADD CONSTRAINT "HotelBooking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelBooking" ADD CONSTRAINT "HotelBooking_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelBooking" ADD CONSTRAINT "HotelBooking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantBooking" ADD CONSTRAINT "RestaurantBooking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantBooking" ADD CONSTRAINT "RestaurantBooking_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantBooking" ADD CONSTRAINT "RestaurantBooking_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantBooking" ADD CONSTRAINT "RestaurantBooking_restaurantTimeSlotId_fkey" FOREIGN KEY ("restaurantTimeSlotId") REFERENCES "RestaurantTimeSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tourBookingId_fkey" FOREIGN KEY ("tourBookingId") REFERENCES "TourBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_hotelBookingId_fkey" FOREIGN KEY ("hotelBookingId") REFERENCES "HotelBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_tourBookingId_fkey" FOREIGN KEY ("tourBookingId") REFERENCES "TourBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_hotelBookingId_fkey" FOREIGN KEY ("hotelBookingId") REFERENCES "HotelBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_tourBookingId_fkey" FOREIGN KEY ("tourBookingId") REFERENCES "TourBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_hotelBookingId_fkey" FOREIGN KEY ("hotelBookingId") REFERENCES "HotelBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Each payment / refund / payout belongs to exactly one tour booking or hotel booking
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_booking_check" CHECK (num_nonnulls("tourBookingId", "hotelBookingId") = 1);
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_booking_check" CHECK (num_nonnulls("tourBookingId", "hotelBookingId") = 1);
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_booking_check" CHECK (num_nonnulls("tourBookingId", "hotelBookingId") = 1);
