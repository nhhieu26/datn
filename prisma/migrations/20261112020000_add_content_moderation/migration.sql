-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('approved', 'pending', 'rejected');

-- CreateEnum
CREATE TYPE "ModerationSource" AS ENUM ('keyword', 'ai', 'admin', 'fallback');

-- CreateEnum
CREATE TYPE "ModerationTarget" AS ENUM ('review', 'article_comment');

-- CreateEnum
CREATE TYPE "ModerationStage" AS ENUM ('keyword', 'ai', 'admin');

-- CreateEnum
CREATE TYPE "ModerationVerdict" AS ENUM ('block', 'approve', 'pending', 'reject');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'content_flagged';

-- AlterTable
ALTER TABLE "Review"
  ADD COLUMN "status" "ModerationStatus" NOT NULL DEFAULT 'approved',
  ADD COLUMN "moderationSource" "ModerationSource",
  ADD COLUMN "moderationReason" TEXT,
  ADD COLUMN "moderationCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "moderatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ArticleComment"
  ADD COLUMN "status" "ModerationStatus" NOT NULL DEFAULT 'approved',
  ADD COLUMN "moderationSource" "ModerationSource",
  ADD COLUMN "moderationReason" TEXT,
  ADD COLUMN "moderationCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "moderatedAt" TIMESTAMP(3);

-- Chuyển bình luận đã bị admin ẩn sang trạng thái kiểm duyệt mới
UPDATE "ArticleComment"
SET "status" = 'rejected', "moderationSource" = 'admin', "moderatedAt" = "updatedAt"
WHERE "isHidden" = true;

ALTER TABLE "ArticleComment" DROP COLUMN "isHidden";

-- CreateTable
CREATE TABLE "ModerationLog" (
    "id" TEXT NOT NULL,
    "target" "ModerationTarget" NOT NULL,
    "targetId" TEXT,
    "userId" TEXT,
    "content" TEXT NOT NULL,
    "stage" "ModerationStage" NOT NULL,
    "verdict" "ModerationVerdict" NOT NULL,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reason" TEXT,
    "confidence" DOUBLE PRECISION,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_status_createdAt_idx" ON "Review"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ArticleComment_status_createdAt_idx" ON "ArticleComment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ModerationLog_createdAt_idx" ON "ModerationLog"("createdAt");

-- CreateIndex
CREATE INDEX "ModerationLog_target_verdict_idx" ON "ModerationLog"("target", "verdict");

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
