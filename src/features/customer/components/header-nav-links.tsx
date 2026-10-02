"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Tour du lịch", href: "/explore?kind=tour" },
  { label: "Khách sạn", href: "/explore?kind=hotel" },
  { label: "Điểm đến", href: "/explore?kind=destination" },
  { label: "Nhà hàng", href: "/explore?kind=restaurant" },
];

const itemClass =
  "px-3.5 py-2 font-medium text-gray-800 hover:text-new-coral inline-flex items-center text-sm transition";

export function HeaderNavLinks() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden md:flex items-center space-x-2 lg:space-x-4"
      data-purpose="main-navigation"
    >
      <div className="pt-0 -mt-2">
        <Link
          className={
            pathname === "/"
              ? "home-bookmark px-6 py-6 font-semibold text-new-teal inline-flex items-center text-sm transition"
              : "px-6 py-6 font-medium text-gray-800 hover:text-new-coral inline-flex items-center text-sm transition"
          }
          href="/"
        >
          Trang chủ
        </Link>
      </div>
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} className={itemClass} href={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
