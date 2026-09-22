import Image from "next/image";

const QUICK_PROMPTS = [
  "Lên kế hoạch 5 ngày tại Nhật Bản",
  "Nhà hàng ngon nhất ở Paris",
  "Tìm khách sạn tại Đà Nẵng",
  "Tạo lịch trình tuần trăng mật",
];

export function AskPlanTravelAiSection() {
  return (
    <section
      className="py-8 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-12"
      data-purpose="ai-assistant-showcase"
    >
      <div className="lg:col-span-4 space-y-6">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111827] tracking-tight leading-[1.05]">
          Hỏi.
          <br />
          Lên Kế Hoạch.
          <br />
          Lên Đường.
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Trợ lý du lịch AI của chúng tôi giúp bạn tìm địa điểm, xây dựng lịch
          trình cá nhân hóa và giải đáp mọi thắc mắc du lịch — chỉ trong vài giây.
        </p>
        <div>
          <button className="inline-flex items-center gap-2 bg-[#111827] hover:bg-black text-white font-semibold px-6 py-3.5 rounded-full shadow transition text-sm">
            <span className="">Trò chuyện với Roamly AI</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M14 5l7 7m0 0l-7 7m7-7H3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="lg:col-span-8 relative flex flex-col md:flex-row items-center justify-end">
        <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-80 h-96 pointer-events-none z-0">
          <div className="absolute right-12 top-0 w-36 h-48 rounded-2xl overflow-hidden shadow-lg border-2 border-white transform rotate-6">
            <Image
              alt="Kyoto Pagoda"
              className="w-full h-full object-cover"
              fill
              sizes="144px"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0QkTuIEylN6WU9-Furw3g8-myxUR0ESi_PJW92SYGp9rVOvHoLuJFfE2f7ccbzfGTht2Z788Aioj3HrFrh0P2Mg4rKuHIdzFzwmfaIZQI20Q5xR1SMysJJR-qI1p7fRRejo_n7urVv58q8tkDpgYR0lF5o-esVgulA7ExrtSBBGzqa93F4WtkM4No4XxXEMpcH4HC4lLKb1oiTkqN2Us6-4UL3hL05KWhdcgMWIY"
            />
          </div>
          <div className="absolute right-0 bottom-4 w-40 h-44 rounded-2xl overflow-hidden shadow-xl border-2 border-white transform -rotate-6">
            <Image
              alt="Santorini Dome"
              className="w-full h-full object-cover"
              fill
              sizes="160px"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLQgcIjjpP4aFlQCoE-fmVnm2G5nEP08kMCyZtab5BIxedGpUmwoe39_6K6i9qb7bAUTt-ytowzUedgXCB5Q3pvLndwS8dlGN8GgNqKQHqqVr6LHKDsGuWH-GqAPAgXZMri0PTz4XjCmowKm4BEsgb9yC39PFL_Hk06sLfxtrAPMKQZ9KMfjvFF9smwsC67Gw3-01XWaU19xSWfDolpHv7MLRDZZADFR16Mp0Q4TQ"
            />
          </div>
          <div className="absolute top-2 right-4 text-gray-700">
            <span className="font-handwriting text-base leading-tight block transform -rotate-6">
              Người bạn đồng hành
              <br />
              du lịch luôn bên bạn
            </span>
            <svg
              className="w-6 h-6 text-gray-700 transform rotate-45 -translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 10h10a5 5 0 015 5v5m0 0l-3-3m3 3l3-3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-gray-100 space-y-6 md:mr-28">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2M7.5 13A2.5 2.5 0 005 15.5 2.5 2.5 0 007.5 18a2.5 2.5 0 002.5-2.5A2.5 2.5 0 007.5 13m9 0a2.5 2.5 0 00-2.5 2.5 2.5 2.5 0 002.5 2.5 2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-2.5-2.5z" />
              </svg>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-xs sm:text-sm text-gray-700 leading-relaxed border border-gray-100">
              <span className="font-bold text-gray-900 block mb-1">
                Xin chào! Tôi là Roamly AI 🖐️
              </span>
              Tôi có thể giúp bạn lên kế hoạch chuyến đi, tìm nơi ở và khám phá
              ẩm thực tốt nhất. Bạn muốn đi đâu?
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                className="text-left px-4 py-2.5 rounded-full border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition truncate"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="relative flex items-center">
            <input
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-3.5 pl-5 pr-14 text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Hỏi tôi bất cứ điều gì..."
              type="text"
            />
            <button className="absolute right-2 w-9 h-9 rounded-full bg-[#111827] hover:bg-black text-white flex items-center justify-center transition shadow-sm">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
