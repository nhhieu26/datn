import Image from "next/image";
import type { Tour } from "../data";
import { HeartIcon } from "./icons";

export function TourCard({ tour }: { tour: Tour }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="relative h-40 overflow-hidden">
        <Image
          alt={tour.name}
          className="object-cover group-hover:scale-105 transition duration-500"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          src={tour.image}
        />
        <button
          aria-label="Lưu tour"
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/70 hover:bg-white backdrop-blur-sm flex items-center justify-center text-slate-700 transition"
        >
          <HeartIcon className="w-4 h-4 text-slate-600" />
        </button>
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-xs text-slate-900 truncate">
          {tour.name}
        </h3>
        <div className="flex items-center justify-between mt-3 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800">
            <span className="text-amber-500">★</span>
            <span>{tour.rating}</span>
            <span className="text-slate-400 font-normal">({tour.reviews})</span>
          </div>
          <span className="text-xs font-bold text-slate-900">${tour.price}</span>
        </div>
      </div>
    </div>
  );
}
