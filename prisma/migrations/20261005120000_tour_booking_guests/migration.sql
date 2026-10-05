-- Trẻ em tính là khách: gộp adults + children thành một cột guests
ALTER TABLE "TourBooking" ADD COLUMN "guests" INTEGER;
UPDATE "TourBooking" SET "guests" = "adults" + "children";
ALTER TABLE "TourBooking" ALTER COLUMN "guests" SET NOT NULL;
ALTER TABLE "TourBooking" DROP COLUMN "adults", DROP COLUMN "children";
