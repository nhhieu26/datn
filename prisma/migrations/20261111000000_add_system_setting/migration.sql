-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "commissionRate" DECIMAL(5,4) NOT NULL DEFAULT 0.1,
    "usdRate" DECIMAL(18,2) NOT NULL DEFAULT 25000,
    "bookingHoldMinutes" INTEGER NOT NULL DEFAULT 10,
    "customerCancelCutoffHours" INTEGER NOT NULL DEFAULT 24,
    "restaurantCancelCutoffHours" INTEGER NOT NULL DEFAULT 2,
    "serviceDeleteGraceDays" INTEGER NOT NULL DEFAULT 30,
    "platformName" TEXT NOT NULL DEFAULT 'Roamly',
    "tagline" TEXT NOT NULL DEFAULT 'Người bạn đồng hành du lịch toàn diện cho khách sạn, nhà hàng, tour và những điểm đến khó quên.',
    "contactAddress" TEXT NOT NULL DEFAULT '70/A Tầng Divo Tower, Hà Nội, Việt Nam',
    "contactPhone" TEXT NOT NULL DEFAULT '(+84) 123 456 789',
    "contactEmail" TEXT NOT NULL DEFAULT 'hello@roamly.vn',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);
