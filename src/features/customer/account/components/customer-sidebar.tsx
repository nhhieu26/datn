"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Hồ sơ của tôi", icon: "person", href: "/profile" },
  { label: "Chuyến đi của tôi", icon: "luggage", href: "#" },
  { label: "Đã lưu", icon: "bookmark", href: "#" },
  { label: "Lịch trình của tôi", icon: "map", href: "#" },
  { label: "Đơn đặt chỗ", icon: "event", href: "#" },
  { label: "Đánh giá", icon: "star", href: "#" },
  { label: "Phương thức thanh toán", icon: "credit_card", href: "#" },
  { label: "Thông báo", icon: "notifications", href: "#" },
  { label: "Cài đặt", icon: "settings", href: "#" },
];

export function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="z-30 hidden w-64 shrink-0 flex-col border-r border-slate-100 bg-white lg:flex">
      <div className="overflow-y-auto p-6">
        <Link
          href="/"
          className="mb-8 flex h-9 items-center"
          aria-label="Roamly"
        >
          <Image
            src="/logo.png"
            alt="Roamly"
            width={2172}
            height={724}
            priority
            className="h-auto w-[135px]"
          />
        </Link>

        <nav aria-label="Menu tài khoản" className="space-y-1 text-sm font-medium">
          {navigation.map((item) => {
            const active =
              item.href !== "#" &&
              (pathname === item.href || pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-2.5 transition-colors ${
                  active
                    ? "bg-brand-50 font-semibold text-brand-600"
                    : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    active ? "text-brand-500" : "text-slate-400"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
