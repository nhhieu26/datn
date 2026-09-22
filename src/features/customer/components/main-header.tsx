import Image from "next/image";
import Link from "next/link";
import { HeaderAuthButton } from "./header-auth-button";

const NAV_ITEMS = [
  { label: "Điểm đến", href: "#destinations" },
  { label: "Tour du lịch", href: "#tours" },
  { label: "Khách sạn", href: "#hotels" },
  { label: "Nhà hàng", href: "#restaurants" },
  { label: "Lập kế hoạch", href: "#planner" },
  { label: "Cẩm nang", href: "#blog" },
];

export function MainHeader() {
  return (
    <header className="w-full flex items-center justify-between pb-1">
      <Link
        className="flex items-center gap-2 group"
        data-purpose="site-brand"
        href="/"
      >
        <Image
          alt="Roamly Logo"
          className="h-8 md:h-9 w-auto object-contain"
          height={724}
          priority
          src="/logo.png"
          width={2172}
        />
      </Link>

      <nav
        className="hidden lg:flex items-center space-x-8 text-sm font-medium text-gray-700"
        data-purpose="desktop-nav"
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            className="hover:text-black transition"
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div
        className="flex items-center space-x-3.5"
        data-purpose="user-actions"
      >
        <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50">
          <span className="">VI</span>
          <svg
            className="w-3.5 h-3.5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M19 9l-7 7-7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>

        <button
          aria-label="Tin nhắn"
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 relative"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-orange rounded-full" />
        </button>

        <HeaderAuthButton />
      </div>
    </header>
  );
}
