import Image from "next/image";
import Link from "next/link";

const COLUMNS = [
  {
    title: "Công ty",
    links: [
      { label: "Về chúng tôi", href: "#" },
      { label: "Tin tức", href: "#" },
      { label: "Câu hỏi thường gặp", href: "#" },
      { label: "Liên hệ", href: "#" },
    ],
  },
  {
    title: "Khám phá",
    links: [
      { label: "Tour du lịch", href: "/explore?kind=tour" },
      { label: "Khách sạn", href: "/explore?kind=hotel" },
      { label: "Nhà hàng", href: "/explore?kind=restaurant" },
      { label: "Điểm đến", href: "/explore?kind=destination" },
    ],
  },
  {
    title: "Liên kết nhanh",
    links: [
      { label: "Trang chủ", href: "/" },
      { label: "Khám phá", href: "/explore" },
      { label: "Đăng nhập", href: "/sign-in" },
    ],
  },
];

const LEGAL_LINKS = [
  "Điều khoản sử dụng",
  "Quyền riêng tư và Cookie",
  "Cách trang web hoạt động",
];

export function MainFooter() {
  return (
    <footer
      className="w-full relative z-20 pt-16 pb-8 px-6 sm:px-8 lg:px-16 text-gray-300 bg-new-footer-bg"
      data-purpose="site-footer"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 pt-4">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-white font-bold text-lg mb-5 tracking-tight">
                {column.title}
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="hover:text-white transition duration-150"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-white font-bold text-lg mb-5 tracking-tight">
              Liên hệ
            </h3>
            <div className="space-y-4 text-sm text-gray-400">
              <p className="leading-relaxed">
                70/A Tầng Divo Tower, Hà Nội, Việt Nam
              </p>
              <a
                className="block hover:text-white transition duration-150"
                href="tel:+84123456789"
              >
                (+84) 123 456 789
              </a>
              <a
                className="block hover:text-white transition duration-150"
                href="mailto:hello@roamly.vn"
              >
                hello@roamly.vn
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl my-8 text-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-8 border-b border-gray-100">
            <div className="lg:col-span-7 pr-0 lg:pr-8">
              <Image
                alt="Roamly Logo"
                className="h-9 w-auto object-contain mb-3"
                height={724}
                src="/logo.png"
                width={2172}
              />
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-md">
                Người bạn đồng hành du lịch toàn diện cho khách sạn, nhà hàng,
                tour và những điểm đến khó quên.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center lg:items-end w-full">
              <div className="w-full max-w-md">
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                  Đăng ký nhận bản tin
                </h4>
                <form className="flex items-center bg-new-input-bg/70 rounded-xl p-1.5 w-full">
                  <input
                    className="flex-1 bg-transparent border-0 px-3.5 py-2 text-xs sm:text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-0"
                    placeholder="Nhập email của bạn"
                    type="email"
                  />
                  <button
                    className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-gray-900 hover:text-black transition duration-150 shrink-0"
                    type="submit"
                  >
                    Đăng ký
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="pt-5 flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-medium text-gray-500">
            {LEGAL_LINKS.map((label) => (
              <Link
                key={label}
                className="hover:text-gray-900 transition duration-150"
                href="#"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 pt-6">
          <div>© 2026 Roamly. Bảo lưu mọi quyền.</div>
          <div>Nhiều điểm đến hơn. Những câu chuyện tuyệt vời hơn.</div>
        </div>
      </div>
    </footer>
  );
}
