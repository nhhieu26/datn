import Image from "next/image";
import Link from "next/link";

const ROBOT_IMAGE = "/AIbanner.png";

export function AskPlanTravelAiSection() {
  return (
    <section
      className="w-full relative z-20 py-16 lg:py-20 page-x bg-white"
      data-purpose="roamly-ai-banner"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 flex items-center justify-center">
          <Image
            alt="Trợ lý du lịch Roamly AI"
            className="w-full h-auto object-contain max-h-[380px] lg:max-h-[420px] drop-shadow-md"
            height={420}
            sizes="(min-width: 1024px) 58vw, 100vw"
            src={ROBOT_IMAGE}
            width={760}
          />
        </div>

        <div className="lg:col-span-5 flex flex-col items-start lg:pl-4">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-7 h-7" viewBox="0 0 32 32">
              <path className="fill-new-coral" d="M18 4L28 24H8L18 4Z" />
              <path className="fill-new-coral-alt" d="M11 12L20 28H2L11 12Z" opacity="0.9" />
            </svg>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              Roamly<span className="text-new-coral">.</span>
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-new-ink leading-[1.18] tracking-tight mb-4">
            Roamly AI đồng hành cùng chuyến đi của bạn
          </h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
            Gợi ý lịch trình, địa điểm, khách sạn và trải nghiệm phù hợp chỉ
            trong vài giây.
          </p>

          <Link
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg hover:scale-105 transition duration-200 bg-new-teal-cta"
            href="/explore"
          >
            <span>Trò chuyện với Roamly AI</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
