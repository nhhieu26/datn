import Image from "next/image";
import type { Hotel } from "../data";
import { HeartIcon } from "./icons";

export function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="relative h-40 overflow-hidden">
        <Image
          alt={hotel.name}
          className="object-cover group-hover:scale-105 transition duration-500"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          src={hotel.image}
        />
        <button
          aria-label="Lưu chỗ ở"
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/70 hover:bg-white backdrop-blur-sm flex items-center justify-center text-slate-700 transition"
        >
          <HeartIcon className="w-4 h-4 text-slate-600" />
        </button>
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-xs text-slate-900 truncate">
          {hotel.name}
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">{hotel.area}</p>
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800">
            <span className="text-amber-500">★</span>
            <span>{hotel.rating}</span>
            <span className="text-slate-400 font-normal">({hotel.reviews})</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900">
              ${hotel.price}
            </span>
            <span className="text-[10px] text-slate-400"> / đêm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
