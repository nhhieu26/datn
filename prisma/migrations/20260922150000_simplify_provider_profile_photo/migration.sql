-- AlterTable
ALTER TABLE "ProviderProfile" DROP COLUMN "licensePathname",
DROP COLUMN "photos",
ADD COLUMN     "photoUrl" TEXT;
