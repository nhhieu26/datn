import Image from "next/image";

const GALLERY = [
  {
    alt: "Bali Coast",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjkO5Jg2dnLryWAvZ9qjw7J7kX3hpsNaIlGAGYYoCprUaVTcz8bCAkimxlGQuZVFh9W26OehDtdBhqWmyubiQ9bSJjPPhr_IU0Hfdwyi-EBQToB6GdgcvOQ78mpBlJSkF1z0Py14QIDedv8xwaV8tzHhg2Y5NOac5s828Th6af7E5DdMhLzhXW2xp_OxZ7NvQeH3dMuLi1NI9ue3kfiOkIin1rXt1a8y2UJBS9h6Y",
  },
  {
    alt: "Bali Resort Pool",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqpF0m2ruTfPpQr78oDobHe5QrNcvOij8Gxsev-Qhm0i6TNFFC74_xaSKWuwM3_0bt9w6vj9VOz2P2W8cmRLSA-AZ2iRZDGBySsUtR6SLggtJqDIK6Ve9gO0v9k1nSNfQ3gIYO2kfF181PRsgdHRAGe21YtCqQyNy21lOUvLHfIBsxck-k4F0or7QmnnxBf9mMCbZERDC18ju1bZ0Bq09wjhCPYOfWlTUj5GX6eDg",
  },
  {
    alt: "Gourmet Dining",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXfqyE457I9VDX9KGeOqkisPTxCiNWU-eeWaLIQYzk2Vym_nuNCroVxptIvzS6mj0yT2yhwZIs-EAtyBsDTdjn939V50oVtqXx9Gif7arOhSLeV99KHCHM1qNI9pfhJ7n2GoIRIzpSF4kAsOXTG-f5eiWL9e36RmiY3vfVGxIpvfEbWJChYxurSEOOJ-QPZFfiQGhVfIUWap7zDLIDX0tZNqrA-_TkasYG_4r4Eps",
  },
  {
    alt: "Balinese Temple",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvujKl5B5Xys9SmYK6mGcLAG6teCbj1q62wOYewxHdGu77aDAVNCYPd9RbVlCsGwIipHrqcIVhLkXGaLiU6Ppqbq0B_AaLbkV-ARF61mkH7cEtESgY4rcvnDsVIPI9-tqaWN_ySLoRm0NEXGOaB0QTMkhBDTq26Xthr5Xhhr6zsP-679uYma1K0WNfQqlQk2dtW88-ILsUpE2U2gKf7c8aDiJZrpWKmjx5uuRpYpY",
  },
];

const ITINERARY = [
  {
    title: "Đền Uluwatu",
    meta: "Ngày 1 • Tham quan",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6Cb3rqV3VkdVx4cf8Rhv-5N0sw8tEE171TD3VOjPU3CyejE8Wa12OQIaa8bvYWgOIBtvk0pIj0YexSNzj2TdLFd8SM5klx8jQHtCbg93nP1Qu8dupcF3mcPodU3TtlIMjycyM0OcGkMjuAIU28M2-un9gMeshX3BWa8kOvHsP_ll5eYQsXqLCrxNu3QJZG0z7UmB-IFTGpw-DQ6y7J9Q_lliaizYl79-lSX1Ad6I",
  },
  {
    title: "Khu nghỉ dưỡng The Kayon Jungle",
    meta: "Ngày 2–4 • Khách sạn",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhP6005HJX-GQYTZf5Y857lFhFL34dE4ZjG4eAnvrfx1OluYas-dZaUJfUZTIT8PK1qApFpDRJbMXaUO8dKXUxW6jNzEQdIAdC-OSS4_m068f23yLELd-QtnKPnpDrAJRksLAIFZn5qzM8DkmgTUoG_gh0l9dPanYbp-VR41E_nP9o4I1q00S7XRF0HWhQ-wBEOwFUGNxphuI-7Q7D_nmzYw4qspVbYgl9xfCILS8",
  },
  {
    title: "Nhà hàng Locavore NXT",
    meta: "Ngày 3 • Ẩm thực",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuChAtmoD5C9PgjewXw91BSEg9szIqRcbMHdFZ-cVxHT8P_mRLDl1aJyY4zh29H2OYSTM91dQi6aE73ty2SsG_lphzTZHOxpHV9Mj_XxUvIPGgMRbA7558FkPJCrhiJQixIwSkortBrP12srmTw3hgDkAzTONeR-MsT-XN3TRv0RKUqyEvshp8s-V57CHQ3PEu52M5U7TUYPnir8kHzM1N728JlTu5-kmxSGZYKeQDM",
  },
  {
    title: "Tour đảo Nusa Penida",
    meta: "Ngày 5 • Trải nghiệm",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiUjI0BdOZFIGEifoie5DVIP-bORPxhF1ZiEYCiUNMVbuPEv4aYL8igN0MylJspiG6aP0t_V-kqFyuFu-Ca5kTD4-55RiAWMdl02aAGyn6a88bz7YeoRaBJEALrgpbfrE36NPiG-QVu5V9ie_Ny1c7QlINuHaVlKGtzeY3tq9v68WhQLhqcqCjvUIc7FM0fJjBzpWr2CWdjielgrqaczjOfGLxtm6bghk7i8SdmEU",
  },
];

export function PersonalizedJourneySection() {
  return (
    <section
      className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-4 mb-8"
      data-purpose="personalized-itinerary"
    >
      <div className="lg:col-span-5 space-y-6">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight leading-[1.12]">
          Hành Trình
          <br />
          Dành Riêng
          <br />
          Cho Bạn
        </h2>
        <p className="text-base text-gray-600 leading-relaxed max-w-md">
          Nhận lịch trình thiết kế riêng kết hợp hoàn hảo giữa điểm đến, khách
          sạn, nhà hàng và các trải nghiệm độc đáo — được hỗ trợ bởi AI.
        </p>
        <div>
          <button className="inline-flex items-center gap-2 bg-[#111827] hover:bg-black text-white font-semibold px-6 py-3.5 rounded-full shadow transition text-sm">
            <span className="">Tạo lịch trình của tôi</span>
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

      <div className="lg:col-span-7 flex justify-center relative">
        <div className="relative w-full max-w-md -translate-x-6">
          <div className="absolute inset-0 bg-white/70 rounded-3xl border border-gray-200/80 shadow-md transform rotate-3 translate-x-3 translate-y-3 pointer-events-none" />
          <div className="absolute inset-0 bg-white/40 rounded-3xl border border-gray-200/50 shadow-sm transform -rotate-2 -translate-x-2 -translate-y-1 pointer-events-none" />

          <div className="relative bg-white rounded-3xl p-6 shadow-xl border border-gray-100 z-10 space-y-5 hover:-translate-y-1 transition duration-500 hover:shadow-2xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-brand-orange text-lg">✦</span>
                <h3 className="text-lg font-bold text-gray-900">
                  7 ngày tại Bali
                </h3>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Sự kết hợp hoàn hảo giữa biển xanh, văn hóa, ẩm thực và phiêu lưu.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden">
              {GALLERY.map((image) => (
                <Image
                  key={image.alt}
                  alt={image.alt}
                  className="w-full h-16 object-cover rounded-xl"
                  height={64}
                  src={image.src}
                  width={120}
                />
              ))}
            </div>

            <div className="space-y-3 pt-1">
              {ITINERARY.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition"
                >
                  <Image
                    alt={item.title}
                    className="w-10 h-10 rounded-lg object-cover"
                    height={40}
                    src={item.src}
                    width={40}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-gray-500">{item.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -bottom-8 -right-8 sm:-right-14 z-20 text-gray-700 hidden sm:block">
            <span className="font-handwriting text-lg leading-tight block transform rotate-6">
              Chuyến đi thiết kế
              <br />
              riêng cho bạn
            </span>
            <svg
              className="w-7 h-7 text-gray-700 transform -rotate-12 translate-x-2"
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
      </div>
    </section>
  );
}
