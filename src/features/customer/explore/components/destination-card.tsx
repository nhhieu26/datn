import Image from "next/image";
import type { Destination } from "../data";
import { ChevronRightIcon, HeartIcon } from "./icons";

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <div className="group relative rounded-2xl overflow-hidden aspect-[4/5] sm:h-64 cursor-pointer shadow-sm hover:shadow-md transition">
      <Image
        alt={destination.name}
        className="object-cover group-hover:scale-105 transition duration-500"
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        src={destination.image}
      />
      <button
        aria-label="Lưu điểm đến"
        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/70 hover:bg-white backdrop-blur-sm flex items-center justify-center text-slate-700 transition"
      >
        <HeartIcon className="w-4 h-4 text-slate-600" />
      </button>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white flex items-end justify-between z-10">
        <div>
          <h3 className="text-base font-bold text-white leading-tight">
            {destination.name}
          </h3>
          <p className="text-[11px] text-white/80 font-normal mt-0.5">
            {destination.tags}
          </p>
          <div className="flex items-center gap-1 mt-1 text-xs text-white font-semibold">
            <span className="text-amber-400">★</span>
            <span>{destination.rating}</span>
            <span className="text-slate-300 font-normal">
              ({destination.reviews})
            </span>
          </div>
        </div>
        <button
          aria-label="Xem điểm đến"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md flex-shrink-0 group-hover:bg-slate-100 transition"
        >
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
