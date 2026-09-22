import Image from "next/image";

const HERO_STATS = [
  { value: "50K+", label: "Chỗ ở" },
  { value: "10K+", label: "Nhà hàng" },
  { value: "5K+", label: "Tour" },
  { value: "100+", label: "Điểm đến" },
];

export function HeroSection() {
  return (
    <section
      className="relative rounded-[32px] overflow-hidden shadow-2xl min-h-[580px] flex items-center mb-12"
      data-purpose="hero-banner"
    >
      <div className="absolute inset-0 z-0">
        <Image
          alt="Tropical bay with karst limestone mountains"
          className="w-full h-full object-cover object-center"
          fill
          priority
          sizes="(max-width: 1440px) 100vw, 1440px"
          src="/hero.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      <div className="relative z-10 w-full p-8 md:p-14 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 text-white space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold tracking-tight leading-[1.08]">
            Khám Phá
            <br />
            Nhiều Hơn
            <br />
            Một Điểm Đến
          </h1>
          <p className="text-base sm:text-lg text-gray-200 max-w-lg font-normal leading-relaxed">
            Khách sạn, nhà hàng, tour trải nghiệm và những điểm đến độc đáo —
            tất cả trong một nơi. Lập kế hoạch thông minh hơn, du lịch sâu sắc
            hơn.
          </p>
          <div className="pt-2">
            <button className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-3.5 rounded-full shadow-lg transition transform hover:-translate-y-0.5 text-sm">
              <span className="">Bắt đầu khám phá</span>
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

          <div className="grid grid-cols-4 gap-4 pt-10 border-t border-white/20 max-w-lg">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-end">
          <div
            className="w-full max-w-[400px] glassmorphism rounded-[26px] p-6 shadow-2xl border border-white/40 text-gray-800"
            data-purpose="trip-booking-card"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-200/60 mb-5">
              <button className="font-bold text-sm text-gray-900 pb-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-[#111827] after:rounded-full">
                Lên lịch trình
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="bg-gray-100/80 hover:bg-gray-100 rounded-2xl p-3 px-4 border border-transparent focus-within:border-gray-300 transition">
                <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Điểm đến
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <input
                    className="w-full bg-transparent p-0 border-none font-semibold text-sm text-gray-900 focus:ring-0"
                    defaultValue="Bali, Indonesia"
                    type="text"
                  />
                </div>
              </div>

              <div className="bg-gray-100/80 hover:bg-gray-100 rounded-2xl p-3 px-4 border border-transparent focus-within:border-gray-300 transition">
                <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Thời gian
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-gray-900">
                    18 Th06, 2026 – 25 Th06, 2026
                  </span>
                </div>
              </div>

              <div className="bg-gray-100/80 hover:bg-gray-100 rounded-2xl p-3 px-4 border border-transparent focus-within:border-gray-300 transition flex items-center justify-between">
                <div>
                  <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Số khách
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">
                      2 người lớn
                    </span>
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              <button className="w-full mt-3 bg-[#111827] hover:bg-black text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                <span className="">Tìm kiếm tất cả</span>
              </button>

              <div className="text-center pt-2">
                <p className="text-[11px] text-gray-500 font-medium tracking-tight">
                  Khách sạn • Nhà hàng • Tour • Điểm đến
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
