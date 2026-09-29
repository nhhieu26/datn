import Image from "next/image";
import type { Restaurant } from "../data";
import { HeartIcon } from "./icons";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="relative h-40 overflow-hidden">
        <Image
          alt={restaurant.name}
          className="object-cover group-hover:scale-105 transition duration-500"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          src={restaurant.image}
        />
        <button
          aria-label="Lưu nhà hàng"
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/70 hover:bg-white backdrop-blur-sm flex items-center justify-center text-slate-700 transition"
        >
          <HeartIcon className="w-4 h-4 text-slate-600" />
        </button>
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-xs text-slate-900 truncate">
          {restaurant.name}
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">{restaurant.area}</p>
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800">
            <span className="text-amber-500">★</span>
            <span>{restaurant.rating}</span>
            <span className="text-slate-400 font-normal">
              ({restaurant.reviews})
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {restaurant.priceLevel}
          </span>
        </div>
      </div>
    </div>
  );
}
