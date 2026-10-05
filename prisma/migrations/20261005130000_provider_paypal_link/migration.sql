-- Liên kết PayPal của provider qua Log in with PayPal
ALTER TABLE "ProviderProfile" ADD COLUMN "paypalPayerId" TEXT,
ADD COLUMN "paypalLinkedAt" TIMESTAMP(3);
