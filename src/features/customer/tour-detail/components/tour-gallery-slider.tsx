"use client";

import Image from "next/image";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const navBtn =
  "absolute top-1/2 z-10 hidden size-16 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-new-title shadow transition-colors hover:bg-new-teal hover:text-white sm:flex";

export function TourGallerySlider({
  images,
  title,
}: {
  images: { url: string }[];
  title: string;
}) {
  // loop cần đủ slide để lặp mượt → nhân ba khi ít ảnh
  const slides = images.length < 4 ? [...images, ...images, ...images] : images;
  return (
    <div className="relative px-5 lg:px-0">
      <Swiper
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        breakpoints={{ 992: { slidesPerView: 2 } }}
        centeredSlides
        loop
        modules={[Navigation, Autoplay]}
        navigation={{
          nextEl: ".tour-slider-next",
          prevEl: ".tour-slider-prev",
        }}
        slidesPerView={1}
        spaceBetween={24}
      >
        {slides.map((img, i) => (
          <SwiperSlide
            key={i}
            className="!h-[190px] overflow-hidden rounded-lg opacity-50 transition-opacity sm:!h-[300px] lg:!h-[520px] lg:!w-[70%] [&.swiper-slide-active]:opacity-100"
          >
            <div className="relative size-full">
              <Image
                alt={title}
                className="object-cover"
                fill
                priority={i === 0}
                sizes="(max-width: 991px) 100vw, 70vw"
                src={img.url}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <button
        aria-label="Ảnh trước"
        className={`tour-slider-prev left-6 ${navBtn}`}
        type="button"
      >
        <span aria-hidden className="material-symbols-outlined">
          chevron_left
        </span>
      </button>
      <button
        aria-label="Ảnh sau"
        className={`tour-slider-next right-6 ${navBtn}`}
        type="button"
      >
        <span aria-hidden className="material-symbols-outlined">
          chevron_right
        </span>
      </button>
    </div>
  );
}
