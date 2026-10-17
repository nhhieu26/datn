"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export const PROVIDER_SIDEBAR_ID = "hs-provider-sidebar";

type HSWindow = Window & {
  HSOverlay?: { close: (target: string) => void };
};

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  children?: { label: string; href: string }[];
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="size-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const navItems: NavItem[] = [
  {
    label: "Bảng điều khiển",
    href: "#",
    icon: (
      <Icon>
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </Icon>
    ),
  },
  {
    label: "Quản lý dịch vụ",
    href: "#",
    icon: (
      <Icon>
        <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
        <path d="M12 22V12" />
        <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
        <path d="m7.5 4.27 9 5.15" />
      </Icon>
    ),
    children: [
      { label: "Tour du lịch", href: "/provider/tours" },
      { label: "Khách sạn & Lưu trú", href: "/provider/hotels" },
      { label: "Nhà hàng & Ẩm thực", href: "/provider/restaurants" },
    ],
  },
  {
    label: "Đơn đặt chỗ",
    href: "#",
    icon: (
      <Icon>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
      </Icon>
    ),
    children: [
      { label: "Đặt tour", href: "/provider/bookings/tours" },
      { label: "Đặt phòng", href: "/provider/bookings/hotels" },
      { label: "Đặt bàn", href: "/provider/bookings/restaurants" },
    ],
  },
  {
    label: "Hồ sơ doanh nghiệp",
    href: "/provider/profiles",
    icon: (
      <Icon>
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
      </Icon>
    ),
  },
  {
    label: "Báo cáo & Thống kê",
    href: "#",
    icon: (
      <Icon>
        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </Icon>
    ),
  },
];

const navLinkClass =
  "flex w-full items-center gap-x-3.5 rounded-lg px-2.5 py-2 text-start text-sm text-sidebar-nav-foreground hover:bg-sidebar-nav-hover focus:bg-sidebar-nav-focus focus:outline-hidden";

function isActive(pathname: string, href: string) {
  return href !== "#" && (pathname === href || pathname.startsWith(`${href}/`));
}

export function ProviderSidebar() {
  const pathname = usePathname();

  useEffect(() => {
    (window as HSWindow).HSOverlay?.close(`#${PROVIDER_SIDEBAR_ID}`);
  }, [pathname]);

  return (
    <div
      id={PROVIDER_SIDEBAR_ID}
      className="hs-overlay font-inter fixed inset-y-0 start-0 z-60 hidden h-full w-64 -translate-x-full transform border-e border-sidebar-line bg-sidebar transition-all duration-300 [--auto-close:lg] hs-overlay-open:translate-x-0 lg:end-auto lg:bottom-0 lg:block lg:translate-x-0"
      role="dialog"
      tabIndex={-1}
      aria-label="Menu chính"
    >
      <div className="relative flex h-full max-h-full flex-col">
        <header className="flex items-center justify-between gap-x-2 p-4">
          <Link
            href="/provider"
            className="flex-none focus:opacity-80 focus:outline-hidden"
            aria-label="Roamly"
          >
            <Image
              src="/logo.png"
              alt="Roamly"
              width={2172}
              height={724}
              priority
              className="h-auto w-28"
            />
          </Link>
          <div className="-me-2 lg:hidden">
            <button
              type="button"
              className="flex size-6 items-center justify-center gap-x-3 rounded-full border border-layer-line bg-layer text-sm text-muted-foreground-2 hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden"
              data-hs-overlay={`#${PROVIDER_SIDEBAR_ID}`}
            >
              <Icon>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </Icon>
              <span className="sr-only">Đóng</span>
            </button>
          </div>
        </header>

        <nav className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb [&::-webkit-scrollbar-track]:bg-scrollbar-track">
          <div
            className="hs-accordion-group flex w-full flex-col flex-wrap px-2 pb-0"
            data-hs-accordion-always-open
          >
            <ul className="flex flex-col space-y-1">
              {navItems.map((item, index) => {
                if (!item.children) {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className={`${navLinkClass} ${active ? "bg-sidebar-nav-active" : ""}`}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    </li>
                  );
                }

                const open = item.children.some((child) =>
                  isActive(pathname, child.href)
                );
                const accordionId = `${PROVIDER_SIDEBAR_ID}-accordion-${index}`;

                return (
                  <li
                    key={item.label}
                    id={accordionId}
                    className={`hs-accordion ${open ? "active" : ""}`}
                  >
                    <button
                      type="button"
                      className={`hs-accordion-toggle ${navLinkClass}`}
                      aria-expanded={open}
                      aria-controls={`${accordionId}-collapse`}
                    >
                      {item.icon}
                      {item.label}
                      <svg
                        className="ms-auto hidden size-4 hs-accordion-active:block"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m18 15-6-6-6 6" />
                      </svg>
                      <svg
                        className="ms-auto block size-4 hs-accordion-active:hidden"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>

                    <div
                      id={`${accordionId}-collapse`}
                      className={`hs-accordion-content w-full overflow-hidden transition-[height] duration-300 ${open ? "" : "hidden"}`}
                      role="region"
                      aria-labelledby={accordionId}
                    >
                      <ul className="space-y-1 ps-8 pt-1">
                        {item.children.map((child) => {
                          const active = isActive(pathname, child.href);
                          return (
                            <li key={child.label}>
                              <Link
                                href={child.href}
                                className={`${navLinkClass} ${active ? "bg-sidebar-nav-active" : ""}`}
                                aria-current={active ? "page" : undefined}
                              >
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}
