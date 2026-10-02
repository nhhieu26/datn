import Image from "next/image";
import Link from "next/link";

const BEACH_IMAGE =
  "/beach.jpg";

export function AboutUsSection() {
  return (
    <section
      className="w-full relative z-20 py-16 px-8 lg:px-16 bg-new-about-bg"
      data-purpose="about-us"
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div className="max-w-xl">
            <p className="font-handwriting text-3xl font-bold mb-2 text-new-coral">
              Về chúng tôi
            </p>
            <h2 className="text-3xl lg:text-[40px] font-extrabold text-gray-900 leading-[1.2] tracking-tight mb-5">
              Trải nghiệm thế giới cùng Roamly
            </h2>
            <div className="space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed">
              <p>
                Du lịch là trải nghiệm giúp mỗi người khám phá những điểm đến,
                nền văn hóa và cảnh quan mới.
              </p>
              <p>
                Đó là hoạt động gắn liền với con người qua nhiều thế kỷ và vẫn
                luôn là nguồn vui, kiến thức và sự trưởng thành.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-start lg:justify-end lg:pr-12">
            <Link
              className="w-36 h-36 sm:w-40 sm:h-40 rounded-full flex items-center justify-center text-white font-bold text-base transition-transform duration-300 hover:scale-105 shadow-lg group bg-new-teal"
              href="/explore"
            >
              <span className="flex items-center gap-1.5 px-4 text-center leading-tight">
                Tìm hiểu thêm
                <svg
                  className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        <div className="relative pt-6">
          <div className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight select-none pointer-events-none relative z-10 pl-2 opacity-35 text-new-about-watermark -translate-y-6 -mb-4">
            15+ Năm Kinh Nghiệm
          </div>
          <div className="relative rounded-[32px] overflow-hidden shadow-2xl h-[420px] sm:h-[500px] lg:h-[580px] w-full">
            <Image
              alt="Bãi biển nhiệt đới nhìn từ trên cao"
              className="object-cover object-center"
              fill
              sizes="(min-width: 1440px) 1300px, 100vw"
              src={BEACH_IMAGE}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
              <button
                aria-label="Phát video"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center bg-white/45 backdrop-blur-md border-[1.5px] border-white/70 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                type="button"
              >
                <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-white/30 border border-white/50">
                  <svg
                    className="w-8 h-8 ml-1 text-new-teal"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
