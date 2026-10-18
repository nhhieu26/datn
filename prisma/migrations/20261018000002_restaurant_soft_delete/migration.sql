-- Xóa nhà hàng: dừng bán ngay, sau thời hạn cron đánh dấu deletedAt (xóa mềm)
ALTER TABLE "Restaurant" ADD COLUMN "deleteScheduledAt" TIMESTAMP(3),
ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "Restaurant_deleteScheduledAt_idx" ON "Restaurant"("deleteScheduledAt");
