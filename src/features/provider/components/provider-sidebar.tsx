"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: string[];
  viewBox?: string;
  filled?: boolean;
  active?: boolean;
  expandable?: boolean;
  children?: { label: string; href: string }[];
};

const navItems: NavItem[] = [
  {
    label: "Bảng điều khiển",
    href: "#",
    icon: [
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    ],
  },
  {
    label: "Quản lý dịch vụ",
    href: "#",
    expandable: true,
    icon: ["M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"],
    children: [
      { label: "Tour du lịch", href: "/provider/tours" },
      { label: "Khách sạn & Lưu trú", href: "/provider/hotels" },
      { label: "Nhà hàng & Ẩm thực", href: "/provider/restaurants" },
    ],
  },
  {
    label: "Đơn đặt chỗ",
    href: "#",
    expandable: true,
    children: [
      { label: "Đặt tour", href: "/provider/bookings/tours" },
      { label: "Đặt phòng", href: "/provider/bookings/hotels" },
      { label: "Đặt bàn", href: "/provider/bookings/restaurants" },
    ],
    icon: [
      "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    ],
  },
  {
    label: "Hồ sơ doanh nghiệp",
    href: "/provider/profiles",
    filled: true,
    viewBox: "0 0 20 20",
    icon: [
      "M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z",
    ],
  },
  {
    label: "Thanh toán / PayPal",
    href: "/provider/payments",
    icon: [
      "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    ],
  },
  {
    label: "Báo cáo & Thống kê",
    href: "#",
    icon: [
      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    ],
  },
];

const navItemClass =
  "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100/70 hover:text-slate-900";
const navItemActiveClass =
  "flex items-center justify-between rounded-xl border border-brand-100/80 bg-brand-50 px-3.5 py-2.5 text-sm font-bold text-brand-600 shadow-sm";

function NavIcon({ item, active }: { item: NavItem; active?: boolean }) {
  if (item.filled) {
    return (
      <svg
        className={`h-5 w-5 ${active ? "text-brand-500" : "text-slate-400"}`}
        fill="currentColor"
        viewBox={item.viewBox ?? "0 0 24 24"}
      >
        {item.icon.map((d) => (
          <path key={d} clipRule="evenodd" d={d} fillRule="evenodd" />
        ))}
      </svg>
    );
  }
  return (
    <svg
      className={`h-5 w-5 ${active ? "text-brand-500" : "text-slate-400"}`}
      fill="none"
      stroke="currentColor"
      viewBox={item.viewBox ?? "0 0 24 24"}
    >
      {item.icon.map((d) => (
        <path
          key={d}
          d={d}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      ))}
    </svg>
  );
}

export function ProviderSidebar({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  const displayName = user.name || user.email || "Đối tác";
  const initial = displayName.charAt(0).toUpperCase();
  const pathname = usePathname();

  const isChildActive = (item: NavItem) =>
    item.children?.some(
      (child) => child.href !== "#" && pathname.startsWith(child.href)
    ) ?? false;

  const [expandedLabel, setExpandedLabel] = useState<string | null>(
    navItems.find((item) => isChildActive(item))?.label ?? null
  );

  return (
    <aside
      className="z-20 flex w-72 shrink-0 select-none flex-col justify-between border-r border-slate-200/80 bg-white"
      data-purpose="sidebar-navigation"
    >
      <div className="overflow-y-auto p-6">
        <Link href="/provider" className="mb-7 flex h-9 items-center" aria-label="Roamly">
          <Image
            src="/logo.png"
            alt="Roamly"
            width={2172}
            height={724}
            priority
            className="h-auto w-[145px]"
          />
        </Link>

        <div className="mb-6 flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-2.5 transition hover:bg-slate-100/70">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white shadow-sm ring-2 ring-white">
              {initial}
            </div>
            <div className="truncate leading-tight">
              <div className="truncate text-sm font-bold text-slate-900">
                {displayName}
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                Bảng điều khiển Đối tác
              </div>
            </div>
          </div>
          <svg
            className="ml-1 h-4 w-4 shrink-0 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 5l7 7-7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </div>

        <nav aria-label="Menu chính" className="space-y-1">
          {navItems.map((item) => {
            const active =
              item.active ??
              (item.href !== "#" && pathname.startsWith(item.href));
            const expanded = expandedLabel === item.label;

            if (item.children) {
              return (
                <div key={item.label}>
                  <button
                    className={`w-full ${
                      active || isChildActive(item)
                        ? navItemActiveClass
                        : navItemClass
                    }`}
                    onClick={() =>
                      setExpandedLabel(expanded ? null : item.label)
                    }
                    type="button"
                  >
                    <div className="flex items-center gap-3.5">
                      <NavIcon item={item} active={active || isChildActive(item)} />
                      <span>{item.label}</span>
                    </div>
                    <svg
                      className={`h-4 w-4 text-slate-400 transition-transform ${
                        expanded ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 5l7 7-7 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </button>
                  {expanded ? (
                    <div className="mt-1 ml-4 space-y-1 border-l border-slate-200 pl-4">
                      {item.children.map((child) => {
                        const childActive =
                          child.href !== "#" && pathname.startsWith(child.href);
                        return (
                          <Link
                            className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                              childActive
                                ? "text-brand-600 font-bold"
                                : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                            }`}
                            href={child.href}
                            key={child.label}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                className={active ? navItemActiveClass : navItemClass}
                href={item.href}
              >
                <div className="flex items-center gap-3.5">
                  <NavIcon item={item} active={active} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-100 p-5">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
          <div className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-800">
            <svg
              className="h-4 w-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>Cần hỗ trợ?</span>
          </div>
          <p className="mb-3.5 text-xs leading-relaxed text-slate-500">
            Truy cập Trung tâm hỗ trợ hoặc kết nối trực tiếp với đội ngũ chăm sóc
            đối tác.
          </p>
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">
            <svg
              className="h-3.5 w-3.5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            Liên hệ Hỗ trợ
          </button>
        </div>
      </div>
    </aside>
  );
}
