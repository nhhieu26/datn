import { auth } from "@/lib/auth";
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

export async function MainHeader() {
  const session = await auth();

  return (
    <header className="w-full flex items-center justify-between pb-1">
      <Link
        className="flex items-center gap-2 group"
        data-purpose="site-brand"
        href="/"
      >
        <Image
          alt="Roamly Logo"
          className="h-10 md:h-11 w-auto object-contain"
          height={724}
          priority
          src="/logo.png"
          width={2172}
        />
      </Link>

      <nav
        className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-gray-700"
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

        {session?.user && (
          <Link
            aria-label="Hồ sơ của tôi"
            href="/profile"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0v.75H4.5v-.75z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </Link>
        )}

        <HeaderAuthButton isAuthenticated={!!session?.user} />
      </div>
    </header>
  );
}
