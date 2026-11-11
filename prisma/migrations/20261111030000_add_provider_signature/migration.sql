-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN "signatureUrl" TEXT,
ADD COLUMN "signatureFileId" TEXT,
ADD COLUMN "signatureUpdatedAt" TIMESTAMP(3);
