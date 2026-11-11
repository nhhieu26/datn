import {
  FadeIn,
  FloatSlow,
  StaggerContainer,
  StaggerItem,
} from "@/features/customer/components/motion";
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
      <FloatSlow
        aria-hidden="true"
        className="absolute -left-12 bottom-0 w-[550px] pointer-events-none select-none"
        distance={10}
        duration={6.5}
      >
        <Image
          alt=""
          aria-hidden="true"
          className="w-full h-auto"
          height={661}
          src="/hero-bg-two-shape.png"
          width={738}
        />
      </FloatSlow>
      <FloatSlow
        aria-hidden="true"
        className="absolute -right-16 bottom-0 w-[560px] pointer-events-none select-none"
        delay={1.2}
        distance={12}
        duration={7.2}
      >
        <Image
          alt=""
          aria-hidden="true"
          className="w-full h-auto"
          height={406}
          src="/hero-bg-two.png"
          width={488}
        />
      </FloatSlow>

      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <StaggerContainer
          className="lg:col-span-7 pr-0 lg:pr-8"
          data-purpose="hero-content"
          inView={false}
          stagger={0.1}
        >
          <StaggerItem>
            <p className="font-handwriting text-2xl lg:text-3xl text-new-coral font-bold tracking-wide mb-3">
              Khám phá thế giới
            </p>
          </StaggerItem>
          <StaggerItem>
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-6 max-w-xl">
              Lên kế hoạch du lịch đến những vùng đất mơ ước chỉ với một cú
              nhấp!
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-lg mb-8">
              Khám phá các tour du lịch trọn gói, khách sạn cao cấp và dịch vụ
              chuyên nghiệp nhất cho hành trình mơ ước của bạn.
            </p>
          </StaggerItem>
          <StaggerItem>
            <Link
              className="inline-flex items-center justify-center bg-new-coral hover:bg-new-coral-hover text-white px-8 py-3.5 rounded-lg font-semibold text-sm sm:text-base shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              data-purpose="cta-booking"
              href="/explore"
            >
              Bắt đầu đặt ngay
            </Link>
          </StaggerItem>
        </StaggerContainer>

        <FadeIn
          className="lg:col-span-5 flex justify-end"
          data-purpose="booking-card-wrapper"
          delay={0.18}
          duration={0.65}
          inView={false}
          x={24}
          y={12}
        >
          <HeroSearchCard locations={locations} />
        </FadeIn>
      </div>
    </section>
  );
}
