import { ArrowRightIcon, RobotMascotIcon } from "./icons";

export function AiItineraryBanner() {
  return (
    <div className="rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-sm relative overflow-hidden bg-gradient-to-r from-indigo-100/90 via-sky-50 to-orange-50/70 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-md flex items-center justify-center flex-shrink-0 border border-indigo-100 text-indigo-600 relative">
          <RobotMascotIcon className="w-10 h-10 text-indigo-500" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Để AI tạo lịch trình hoàn hảo cho bạn
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
            Kết hợp điểm đến, khách sạn, nhà hàng và trải nghiệm thành một kế
            hoạch du lịch cá nhân hóa — chỉ trong vài giây.
          </p>
        </div>
      </div>

      <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wide shadow-md transition whitespace-nowrap">
        <span>Tạo lịch trình của tôi</span>
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
