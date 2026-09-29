import {
  AiItineraryBanner,
  BedFilledIcon,
  ChevronDownIcon,
  CompassFilledIcon,
  DESTINATIONS,
  DestinationCard,
  FilterSidebar,
  HeroBanner,
  HOTELS,
  HotelCard,
  MapPinFilledIcon,
  RESTAURANTS,
  RestaurantCard,
  ResultSection,
  TOURS,
  TourCard,
  UtensilsFilledIcon,
} from "@/features/customer/explore";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khám phá Bali, Indonesia — Roamly",
  description:
    "Tìm khách sạn, nhà hàng, tour trải nghiệm và điểm đến tuyệt đẹp tại Bali.",
};

const CARD_GRID = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4";

export default function ExplorePage() {
  return (
    <div className="space-y-7 pt-1 pb-10 font-[family-name:var(--font-inter)]">
      <HeroBanner />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <FilterSidebar />

        <section className="lg:col-span-9 space-y-10">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-600">
              1.024 kết quả
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">
                Sắp xếp theo
              </span>
              <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 transition">
                <span>Đề xuất</span>
                <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <ResultSection
            actionHref="#"
            actionLabel="Xem tất cả điểm đến"
            icon={<MapPinFilledIcon className="w-7 h-7" />}
            subtitle="Những nơi tuyệt đẹp bạn không nên bỏ lỡ"
            title="Điểm đến phổ biến"
          >
            <div className={CARD_GRID}>
              {DESTINATIONS.map((destination) => (
                <DestinationCard
                  key={destination.name}
                  destination={destination}
                />
              ))}
            </div>
          </ResultSection>

          <ResultSection
            actionHref="#"
            actionLabel="Xem tất cả khách sạn"
            icon={<BedFilledIcon className="w-7 h-7" />}
            subtitle="Khách sạn được chọn lọc cho chuyến đi Bali"
            title="Nơi lưu trú"
          >
            <div className={CARD_GRID}>
              {HOTELS.map((hotel) => (
                <HotelCard key={hotel.name} hotel={hotel} />
              ))}
            </div>
          </ResultSection>

          <ResultSection
            actionHref="#"
            actionLabel="Xem tất cả nhà hàng"
            icon={<UtensilsFilledIcon className="w-7 h-7" />}
            subtitle="Đồ ăn ngon, trải nghiệm tuyệt vời hơn"
            title="Nhà hàng hàng đầu"
          >
            <div className={CARD_GRID}>
              {RESTAURANTS.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.name}
                  restaurant={restaurant}
                />
              ))}
            </div>
          </ResultSection>

          <ResultSection
            actionHref="#"
            actionLabel="Xem tất cả tour"
            icon={<CompassFilledIcon className="w-7 h-7" />}
            subtitle="Những cuộc phiêu lưu khó quên đang chờ bạn"
            title="Tour & Trải nghiệm nổi bật"
          >
            <div className={CARD_GRID}>
              {TOURS.map((tour) => (
                <TourCard key={tour.name} tour={tour} />
              ))}
            </div>
          </ResultSection>

          <AiItineraryBanner />
        </section>
      </div>
    </div>
  );
}
