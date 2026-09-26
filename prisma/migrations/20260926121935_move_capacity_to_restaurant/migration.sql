/*
  Warnings:

  - You are about to drop the column `capacity` on the `RestaurantTimeSlot` table. All the data in the column will be lost.
  - Added the required column `capacity` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "capacity" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RestaurantTimeSlot" DROP COLUMN "capacity";
