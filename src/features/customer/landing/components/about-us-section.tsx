import { FadeIn, ParallaxBox } from "@/features/customer/components/motion";
import Link from "next/link";
import { parseVideoUrl } from "@/shared/lib/parse-video-url";
import { AboutVideoPlayer } from "./about-video-player";

const BEACH_IMAGE = "/beach.jpg";

export function AboutUsSection({
  videoUrl,
  posterUrl,
}: {
  videoUrl?: string;
  posterUrl?: string;
}) {
  const video = parseVideoUrl(videoUrl);
  return (
    <section
      className="w-full relative z-20 py-16 page-x bg-new-about-bg overflow-hidden"
      data-purpose="about-us"
    >
      <div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <FadeIn className="max-w-xl" x={-20} y={12}>
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
          </FadeIn>
          <FadeIn
            className="flex items-center justify-start lg:justify-end lg:pr-12"
            delay={0.12}
            scale={0.92}
            y={12}
          >
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
                  <path
                    d="M7 17L17 7M17 7H7M17 7V17"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </FadeIn>
        </div>

        <div className="relative pt-6">
          <ParallaxBox offset={18}>
            <div className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight select-none pointer-events-none relative z-10 pl-2 opacity-35 text-new-about-watermark -translate-y-6 -mb-4">
              15+ Năm Kinh Nghiệm
            </div>
          </ParallaxBox>
          <FadeIn
            className="relative rounded-[32px] overflow-hidden shadow-2xl h-[420px] sm:h-[500px] lg:h-[580px] w-full group"
            duration={0.7}
            scale={0.98}
            y={24}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Bãi biển nhiệt đới nhìn từ trên cao"
              className="absolute inset-0 size-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
              src={posterUrl?.trim() || BEACH_IMAGE}
            />
            {video && (
              <AboutVideoPlayer
                poster={posterUrl?.trim() || undefined}
                video={video}
              />
            )}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
