import Image from "next/image";
import { EXPLORE_HERO_IMAGE } from "../data";
import {
  BookOutlineIcon,
  GridFilledIcon,
  HandDrawnArrowIcon,
  HomeOutlineIcon,
  MapPinOutlineIcon,
  PencilIcon,
  SmileOutlineIcon,
} from "./icons";

const CATEGORY_PILLS = [
  { label: "Tất cả", Icon: GridFilledIcon, active: true },
  { label: "Điểm đến", Icon: MapPinOutlineIcon, active: false },
  { label: "Khách sạn", Icon: HomeOutlineIcon, active: false },
  { label: "Nhà hàng", Icon: BookOutlineIcon, active: false },
  { label: "Tour & Trải nghiệm", Icon: SmileOutlineIcon, active: false },
];

export function HeroBanner() {
  return (
    <section className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-100 min-h-[340px] flex flex-col justify-between p-6 sm:p-9 text-white bg-slate-900">
      <div className="absolute inset-0 z-0">
        <Image
          alt="Bờ biển Bali"
          className="object-cover object-center brightness-[0.78]"
          fill
          priority
          sizes="(max-width: 1440px) 100vw, 1440px"
          src={EXPLORE_HERO_IMAGE}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50" />
      </div>

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-300">
          <a className="hover:text-white transition" href="#">
            Trang chủ
          </a>
          <span>›</span>
          <span className="text-white font-semibold">Khám phá</span>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-xs font-medium border border-white/30 transition shadow-sm">
          <span>Chỉnh sửa tìm kiếm</span>
          <PencilIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative z-10 my-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
          Bali, Indonesia
        </h1>
        <p className="text-sm sm:text-base text-slate-200 mt-2 font-medium tracking-wide">
          18 Th06, 2026 – 25 Th06, 2026 &nbsp;•&nbsp; 2 du khách
        </p>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div className="flex items-center flex-wrap gap-2">
          {CATEGORY_PILLS.map(({ label, Icon, active }) =>
            active ? (
              <button
                key={label}
                className="flex items-center gap-2 bg-white text-slate-900 font-bold px-4 py-2 rounded-full text-xs shadow-md transition transform active:scale-95"
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ) : (
              <button
                key={label}
                className="flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium border border-white/20 transition"
              >
                <Icon className="w-3.5 h-3.5 text-slate-300" />
                <span>{label}</span>
              </button>
            ),
          )}
        </div>

        <div className="hidden lg:flex items-center gap-2 self-end mb-1 text-right">
          <div className="font-handwriting text-2xl text-slate-100 font-semibold tracking-wide drop-shadow select-none">
            Mọi thứ bạn cần
            <br />
            cho chuyến đi hoàn hảo
          </div>
          <HandDrawnArrowIcon className="w-9 h-9 text-white -rotate-12 translate-y-2 opacity-90" />
        </div>
      </div>
    </section>
  );
}
