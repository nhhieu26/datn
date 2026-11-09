-- CreateTable
CREATE TABLE "ExternalArea" (
    "id" TEXT NOT NULL,
    "queryKey" TEXT NOT NULL,
    "result" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalArea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalArea_queryKey_key" ON "ExternalArea"("queryKey");
