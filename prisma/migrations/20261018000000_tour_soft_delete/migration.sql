-- Xóa tour: dừng bán ngay, sau thời hạn cron đánh dấu deletedAt (xóa mềm)
ALTER TABLE "Tour" ADD COLUMN "deleteScheduledAt" TIMESTAMP(3),
ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "Tour_deleteScheduledAt_idx" ON "Tour"("deleteScheduledAt");
