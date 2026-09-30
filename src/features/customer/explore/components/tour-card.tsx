import Image from "next/image";
import type { ExploreItem } from "../data";
import { HeartIcon, KindIcon, MapPinIcon } from "./icons";

export function TourCard({ item }: { item: ExploreItem }) {
  return (
    <article
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
      data-purpose="explore-card"
    >
      <div>
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            alt={item.title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            src={item.image}
          />
          <button
            aria-label="Lưu"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors shadow"
            type="button"
          >
            <HeartIcon className="w-4 h-4" />
          </button>
          <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm flex items-center gap-1">
            <KindIcon className="w-3.5 h-3.5 text-gray-700" kind="tour" />
            Tour
          </span>
        </div>
        <div className="p-4 space-y-2">
          <h3 className="text-base font-bold text-gray-900 leading-snug">
            {item.title}
          </h3>
          <div className="flex items-center text-xs text-gray-500 gap-1">
            <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>{item.location}</span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
          <div className="flex items-center gap-1 pt-1 text-xs font-medium text-gray-800">
            <span className="text-amber-500 font-bold">★ {item.rating}</span>
            <span className="text-gray-400">({item.reviews} đánh giá)</span>
          </div>
        </div>
      </div>
      <div className="p-4 pt-0 flex items-center justify-between">
        <div>
          <span className="text-[13px] font-bold text-gray-900">
            {item.price}
          </span>
          <span className="text-xs text-gray-400 font-normal">
            {" "}
            {item.priceUnit}
          </span>
        </div>
        <button
          aria-label="Xem chi tiết"
          className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
          type="button"
        >
          <span className="text-sm">→</span>
        </button>
      </div>
    </article>
  );
}
