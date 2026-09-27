-- CreateTable
CREATE TABLE "HotelTag" (
    "hotelId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HotelTag_pkey" PRIMARY KEY ("hotelId","tagId")
);

-- AddForeignKey
ALTER TABLE "HotelTag" ADD CONSTRAINT "HotelTag_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelTag" ADD CONSTRAINT "HotelTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
