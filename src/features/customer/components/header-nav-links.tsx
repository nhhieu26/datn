"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const NAV_ITEMS = [
  { label: "Trang chủ", href: "/", kind: null },
  { label: "Tour du lịch", href: "/explore?kind=tour", kind: "tour" },
  { label: "Khách sạn", href: "/explore?kind=hotel", kind: "hotel" },
  { label: "Điểm đến", href: "/explore?kind=destination", kind: "destination" },
  { label: "Nhà hàng", href: "/explore?kind=restaurant", kind: "restaurant" },
];

const itemClass =
  "px-3.5 py-2 font-medium text-gray-800 hover:text-new-coral inline-flex items-center text-sm transition";
const itemActiveClass =
  "home-bookmark px-6 py-6 font-semibold text-new-teal inline-flex items-center text-sm transition";

export function HeaderNavLinks() {
  const pathname = usePathname();
  const kind = useSearchParams().get("kind");

  return (
    <nav
      className="hidden md:flex items-center space-x-2 lg:space-x-4"
      data-purpose="main-navigation"
    >
      {NAV_ITEMS.map((item) => {
        const active =
          item.kind === null
            ? pathname === "/"
            : pathname === "/explore" && kind === item.kind;
        return (
          <div key={item.href} className={active ? "pt-0 -mt-2" : undefined}>
            <Link
              className={active ? itemActiveClass : itemClass}
              href={item.href}
            >
              {item.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
