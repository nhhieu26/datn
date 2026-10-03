import { Rating, formatPrice } from "@/features/customer/components/cards/card-parts";
import type { HotelDetail } from "../lib/to-hotel-detail";

export function HotelDetailHeading({ hotel }: { hotel: HotelDetail }) {
  return (
    <div className="flex flex-wrap justify-between gap-5 pt-10 pb-6">
      <div className="flex flex-col">
        <h2 className="text-2xl leading-[1.1] font-bold text-new-title lg:text-[40px]">
          {hotel.name}
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-3">
          <div className="flex items-center gap-2 text-new-teal">
            <span aria-hidden className="material-symbols-outlined">
              location_on
            </span>
            <div className="text-base font-bold lg:text-lg">
              {hotel.location}
            </div>
          </div>
          <div className="hidden h-5 w-px bg-new-paragraph/30 sm:block" />
          <div className="flex flex-wrap items-center gap-5 text-new-title">
            <div className="flex items-center gap-2.5">
              <span aria-hidden className="material-symbols-outlined">
                bed
              </span>
              <p>{hotel.rooms.length} loại phòng</p>
            </div>
            <div className="flex items-center gap-2.5">
              <span aria-hidden className="material-symbols-outlined">
                group
              </span>
              <p>Tối đa {hotel.maxCapacity} khách/phòng</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-end gap-2.5">
          <p>Từ</p>
          <p className="text-2xl font-bold text-new-title">
            {formatPrice(hotel.minPrice)}
          </p>
          <p>/đêm</p>
        </div>
        <Rating />
        {/* ponytail: chưa có module booking/đánh giá nên hardcode số lượt đặt */}
        <p className="text-sm text-new-paragraph">128 lượt đặt</p>
      </div>
    </div>
  );
}
