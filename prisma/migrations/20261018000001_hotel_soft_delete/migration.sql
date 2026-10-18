-- Xóa khách sạn: dừng bán ngay, sau thời hạn cron đánh dấu deletedAt (xóa mềm)
ALTER TABLE "Hotel" ADD COLUMN "deleteScheduledAt" TIMESTAMP(3),
ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "Hotel_deleteScheduledAt_idx" ON "Hotel"("deleteScheduledAt");
