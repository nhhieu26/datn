import Image from "next/image";
import Link from "next/link";
import { destinationRepo } from "@/entities/destination";

const FALLBACK_IMAGE = "/image-notfound.png";

type Destination = Awaited<
  ReturnType<typeof destinationRepo.findRecent>
>[number];

function firstImage(destination: Destination): string {
  const image = (destination.images as { url?: string }[] | null)?.[0];
  // ponytail: fallback ảnh trống; thay bằng ô trống riêng khi cần
  return image?.url ?? FALLBACK_IMAGE;
}

export function PopularDestinations({
  destinations,
}: {
  destinations: Destination[];
}) {
  return (
    <section className="space-y-5 mb-8" data-purpose="popular-destinations">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Điểm Đến Phổ Biến
        </h2>
        <Link
          className="group text-xs sm:text-sm font-semibold text-gray-700 hover:text-black flex items-center gap-1.5 transition"
          href="#all-destinations"
        >
          <span className="">Xem tất cả điểm đến</span>
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-200"
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
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {destinations.map((destination) => (
          <div
            key={destination.id}
            className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <Image
              alt={destination.name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              src={firstImage(destination)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-3 inset-x-3 flex items-end justify-between text-white">
              <div>
                <h3
                  className="font-bold text-sm leading-tight"
                  title={destination.name}
                >
                  {destination.name}
                </h3>
                <p className="text-[11px] text-gray-300 line-clamp-1">
                  {destination.province.name}
                </p>
              </div>
              <span className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition">
                <svg
                  className="w-3.5 h-3.5"
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
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
