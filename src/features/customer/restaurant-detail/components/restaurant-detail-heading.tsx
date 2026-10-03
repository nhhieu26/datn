import { Rating, formatPrice } from "@/features/customer/components/cards/card-parts";
import {
  minMenuPrice,
  openingLabel,
  type RestaurantDetail,
} from "../lib/restaurant-detail";

export function RestaurantDetailHeading({
  restaurant,
}: {
  restaurant: RestaurantDetail;
}) {
  const opening = openingLabel(restaurant.timeSlots);
  return (
    <div className="flex flex-wrap justify-between gap-5 pt-10 pb-6">
      <div className="flex flex-col">
        <h2 className="text-2xl leading-[1.1] font-bold text-new-title lg:text-[40px]">
          {restaurant.name}
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-3">
          <div className="flex items-center gap-2 text-new-teal">
            <span aria-hidden className="material-symbols-outlined">
              location_on
            </span>
            <div className="text-base font-bold lg:text-lg">
              {restaurant.address}, {restaurant.location}
            </div>
          </div>
          <div className="hidden h-5 w-px bg-new-paragraph/30 sm:block" />
          <div className="flex flex-wrap items-center gap-5 text-new-title">
            {opening && (
              <div className="flex items-center gap-2.5">
                <span aria-hidden className="material-symbols-outlined">
                  schedule
                </span>
                <p>{opening}</p>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <span aria-hidden className="material-symbols-outlined">
                group
              </span>
              <p>Sức chứa {restaurant.capacity} khách</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-end gap-2.5">
          <p>Món từ</p>
          <p className="text-2xl font-bold text-new-title">
            {formatPrice(minMenuPrice(restaurant.menu))}
          </p>
        </div>
        <Rating />
      </div>
    </div>
  );
}
