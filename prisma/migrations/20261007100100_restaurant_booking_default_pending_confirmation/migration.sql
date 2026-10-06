-- Tách migration: Postgres không cho dùng giá trị enum vừa thêm trong cùng transaction
ALTER TABLE "RestaurantBooking" ALTER COLUMN "status" SET DEFAULT 'pending_confirmation';
