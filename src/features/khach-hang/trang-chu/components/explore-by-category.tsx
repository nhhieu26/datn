import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  {
    title: "Điểm đến",
    description: "Khám phá những vùng đất tuyệt mỹ khắp thế giới",
    cta: "Khám phá",
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMKq8nD6jmioPVZuQJA-KRLf_FVxm5fs5ULZWJss70JFuvCEHvMP4IGevDGU_YweOmpKCKWdccCer29Sq3tiApf-M5XziWOnY_RWqqkpenLHRmzIPAqc3hAPtlhUl0e765dXdkEZQTiZKJ6wnyqtKwa_YhEUFL5ZlKWbsRtfH2rbTF8HM5G_ujZLFNV0oUmWYqPhmaNRwdO-1KZ6gfdeEyzVHEoJJsbkGybt4OVWw",
  },
  {
    title: "Khách sạn",
    description: "Tìm chốn dừng chân hoàn hảo cho bạn",
    cta: "Tìm khách sạn",
    icon: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDc12QM-J9YpM_hah6ij2nF4mhHoklqfdVodpkJFWq8z7zCIiVz74dQmzk5ognqNh1Bunl0i7kmcMKm8bDXhhGSl-N00SXYpopyGsCXdE30WgvrjMzViOWIncptr7jOYU_4VjvqwYCaqGlpJNfeshha-vae8iqwxtmtMxDHkDWPMenWOdU72RbIyIhYr-eACmmWdAgSQ2GB2oVHWTcgWR91-inhxD91eEJCmnDfDwM",
  },
  {
    title: "Nhà hàng",
    description: "Trải nghiệm ẩm thực phong phú và tinh tế",
    cta: "Tìm nhà hàng",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5QGJTLD8jJaOCPoJQkNBpINHSaAaGW4HJOTU3d6wNqM7woYHsQmp4W50uxokMYRYZG8i-0iqYoGaLqY4ZjGxiUvpqroyR3EAz2lJ1ok-WPY9orCMHTVz4sE_sfQkETbxOJapcRBHELwK9MRSDDnCR0UsarSx1OReQAlFWufYMXgDnPj_RumKFsTt3Q2dX6dhPm0xIxSAcY4n0BiBZFL9cstg4eE53CmAycj8SF7U",
  },
  {
    title: "Tour & Trải nghiệm",
    description: "Những hành trình khó quên đang chờ đón bạn",
    cta: "Khám phá tour",
    icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUy72qk4ijkXGjuc3ajyuyUjfLARYHyUH_LuMzjCFFPIE2lenR1pRJRxYUgrdoRasDZiBSiEWXcgZYozjtFSCa1aD1dWhkvfFukRZCVsw25NKxEUoH1_YEBzRVu85QhxCxynRVikvkEXMctGnk1EZ6es1a3mFYHzqEGUj_Za5b8dWmawKqsKWa7VEpZjrweYZ-TYlaqGMs6Q1zYSCQk1raxkT92YsthpEP8rHj634",
  },
];

export function ExploreByCategory() {
  return (
    <section className="space-y-6 mb-12" data-purpose="categories-section">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Khám Phá Theo Danh Mục
        </h2>
        <Link
          className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-black flex items-center gap-1.5 transition"
          href="#all-categories"
        >
          <span className="">Xem tất cả danh mục</span>
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
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CATEGORIES.map((category) => (
          <div
            key={category.title}
            className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4">
              <Image
                alt={category.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                src={category.src}
              />
              <div className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-800">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d={category.icon}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
            <div className="px-2 space-y-1 mb-4">
              <h3 className="font-bold text-base text-gray-900">
                {category.title}
              </h3>
              <p className="text-xs text-gray-500 leading-snug">
                {category.description}
              </p>
            </div>
            <button className="w-full py-2.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition">
              <span className="">{category.cta}</span>
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
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
