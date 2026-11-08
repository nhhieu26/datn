-- CreateEnum
CREATE TYPE "TripMeal" AS ENUM ('breakfast', 'lunch', 'dinner');

-- AlterTable
ALTER TABLE "TripStop" ADD COLUMN "meal" "TripMeal";
