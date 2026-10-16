-- Dịch vụ tạo mới là published ngay, bỏ trạng thái pending/rejected
-- Đổi dữ liệu cũ trước khi thu hẹp enum
UPDATE "Tour" SET "status" = 'published' WHERE "status" IN ('pending', 'rejected');
UPDATE "Hotel" SET "status" = 'published' WHERE "status" IN ('pending', 'rejected');
UPDATE "Room" SET "status" = 'published' WHERE "status" IN ('pending', 'rejected');
UPDATE "Restaurant" SET "status" = 'published' WHERE "status" IN ('pending', 'rejected');

CREATE TYPE "ServiceStatus_new" AS ENUM ('published', 'paused');

ALTER TABLE "Tour" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Tour" ALTER COLUMN "status" TYPE "ServiceStatus_new" USING "status"::text::"ServiceStatus_new";
ALTER TABLE "Tour" ALTER COLUMN "status" SET DEFAULT 'published';

ALTER TABLE "Hotel" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Hotel" ALTER COLUMN "status" TYPE "ServiceStatus_new" USING "status"::text::"ServiceStatus_new";
ALTER TABLE "Hotel" ALTER COLUMN "status" SET DEFAULT 'published';

ALTER TABLE "Room" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Room" ALTER COLUMN "status" TYPE "ServiceStatus_new" USING "status"::text::"ServiceStatus_new";
ALTER TABLE "Room" ALTER COLUMN "status" SET DEFAULT 'published';

ALTER TABLE "Restaurant" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Restaurant" ALTER COLUMN "status" TYPE "ServiceStatus_new" USING "status"::text::"ServiceStatus_new";
ALTER TABLE "Restaurant" ALTER COLUMN "status" SET DEFAULT 'published';

DROP TYPE "ServiceStatus";
ALTER TYPE "ServiceStatus_new" RENAME TO "ServiceStatus";
