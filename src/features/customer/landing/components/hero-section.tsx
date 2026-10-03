import Image from "next/image";
import Link from "next/link";
import { HeroSearchCard } from "./hero-search-card";

type HeroSectionProps = { locations: string[] };

export function HeroSection({ locations }: HeroSectionProps) {
  return (
    <section
      className="w-full relative z-30 overflow-hidden hero-bg-sketch py-8 lg:py-16 page-x"
      data-purpose="hero-section"
    >
      <Image
        alt=""
        aria-hidden="true"
        className="absolute -left-12 bottom-0 w-[550px] h-auto pointer-events-none select-none"
        height={661}
        src="/hero-bg-two-shape.png"
        width={738}
      />
      <Image
        alt=""
        aria-hidden="true"
        className="absolute -right-16 bottom-0 w-[560px] h-auto pointer-events-none select-none"
        height={406}
        src="/hero-bg-two.png"
        width={488}
      />

      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <div className="lg:col-span-7 pr-0 lg:pr-8" data-purpose="hero-content">
          <p className="font-handwriting text-2xl lg:text-3xl text-new-coral font-bold tracking-wide mb-3">
            Khám phá thế giới
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-6 max-w-xl">
            Lên kế hoạch du lịch đến những vùng đất mơ ước chỉ với một cú nhấp!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-lg mb-8">
            Khám phá các tour du lịch trọn gói, khách sạn cao cấp và dịch vụ
            chuyên nghiệp nhất cho hành trình mơ ước của bạn.
          </p>
          <Link
            className="inline-flex items-center justify-center bg-new-coral hover:bg-new-coral-hover text-white px-8 py-3.5 rounded-lg font-semibold text-sm sm:text-base shadow-sm hover:shadow transition duration-200"
            data-purpose="cta-booking"
            href="/explore"
          >
            Bắt đầu đặt ngay
          </Link>
        </div>

        <div
          className="lg:col-span-5 flex justify-end"
          data-purpose="booking-card-wrapper"
        >
          <HeroSearchCard locations={locations} />
        </div>
      </div>
    </section>
  );
}
