import Image from "next/image";
import Link from "next/link";

const EXPLORE_LINKS = ["Điểm đến", "Khách sạn", "Nhà hàng", "Tour"];
const SUPPORT_LINKS = [
  "Trung tâm trợ giúp",
  "Liên hệ",
  "Mẹo du lịch",
  "Câu hỏi thường gặp",
];

export function MainFooter() {
  return (
    <footer
      className="bg-[#111827] text-white rounded-[32px] p-8 md:p-14 space-y-12"
      data-purpose="site-footer"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-10 border-b border-gray-800 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Image
              alt="Roamly Logo"
              className="h-8 w-auto"
              height={724}
              src="/logo-white.png"
              width={2172}
            />
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Nhiều điểm đến hơn. Những câu chuyện tuyệt vời hơn.
          </p>
        </div>
        <button className="bg-gradient-to-r from-brand-orange to-brand-coral hover:opacity-95 text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transition">
          <span className="">Bắt đầu chuyến phiêu lưu</span>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">
            Roamly
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed pr-4">
            Người bạn đồng hành du lịch toàn diện cho khách sạn, nhà hàng, tour
            và những điểm đến khó quên.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">
            Khám phá
          </h4>
          <ul className="space-y-2 text-xs text-gray-400">
            {EXPLORE_LINKS.map((link) => (
              <li key={link}>
                <Link className="hover:text-white transition" href="#">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">
            Hỗ trợ
          </h4>
          <ul className="space-y-2 text-xs text-gray-400">
            {SUPPORT_LINKS.map((link) => (
              <li key={link}>
                <Link className="hover:text-white transition" href="#">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">
            Tải ứng dụng
          </h4>
          <div className="flex flex-col gap-2 pt-1">
            <Link
              className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-black border border-gray-700 text-white hover:border-gray-500 transition w-fit"
              href="#"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.4c.66-.8 1.11-1.92.99-3.04-.96.04-2.13.64-2.81 1.44-.6.69-1.13 1.83-.99 2.92 1.07.08 2.16-.54 2.81-1.32z" />
              </svg>
              <div className="text-left leading-none">
                <span className="block text-[8px] uppercase tracking-wide text-gray-400">
                  Tải về trên
                </span>
                <span className="text-xs font-semibold">App Store</span>
              </div>
            </Link>
            <Link
              className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-black border border-gray-700 text-white hover:border-gray-500 transition w-fit"
              href="#"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a1.987 1.987 0 01-.61-1.428V3.242c0-.555.225-1.056.609-1.428zm11.597 11.598l2.557 2.557-12.28 7.089 9.723-9.646zm2.557-2.824l-2.557 2.557L5.483 3.5l12.28 7.088zm1.096 1.096l2.844 1.642a1.2 1.2 0 010 2.08l-2.844 1.642-2.146-2.146 2.146-2.218z" />
              </svg>
              <div className="text-left leading-none">
                <span className="block text-[8px] uppercase tracking-wide text-gray-400">
                  TẢI TRÊN
                </span>
                <span className="text-xs font-semibold">Google Play</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 pt-3 text-gray-400">
            <Link
              aria-label="Instagram"
              className="hover:text-white transition"
              href="#"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </Link>
            <Link
              aria-label="Facebook"
              className="hover:text-white transition"
              href="#"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.7 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
              </svg>
            </Link>
            <Link
              aria-label="X"
              className="hover:text-white transition"
              href="#"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
            <Link
              aria-label="YouTube"
              className="hover:text-white transition"
              href="#"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <div className="">© 2026 Roamly. Bảo lưu mọi quyền.</div>
        <div className="flex items-center space-x-6">
          <Link className="hover:text-gray-300 transition" href="#">
            Quyền riêng tư
          </Link>
          <Link className="hover:text-gray-300 transition" href="#">
            Điều khoản
          </Link>
          <Link className="hover:text-gray-300 transition" href="#">
            Sơ đồ trang
          </Link>
        </div>
      </div>
    </footer>
  );
}
