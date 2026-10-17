"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export const ADMIN_SIDEBAR_ID = "hs-admin-sidebar";

type HSWindow = Window & {
  HSOverlay?: { close: (target: string) => void };
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

const navigation = [
  {
    label: "Tổng quan",
    href: "/admin",
    icon: (
      <Icon>
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </Icon>
    ),
  },
  {
    label: "Duyệt hồ sơ đối tác",
    href: "/admin/profile-approval",
    icon: (
      <Icon>
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="m9 14 2 2 4-4" />
      </Icon>
    ),
  },
  {
    label: "Duyệt dịch vụ",
    href: "#",
    icon: (
      <Icon>
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
        <path d="m9 12 2 2 4-4" />
      </Icon>
    ),
  },
  {
    label: "Quản lý địa điểm",
    href: "/admin/destinations",
    icon: (
      <Icon>
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" />
      </Icon>
    ),
  },
  {
    label: "Quản lý người dùng",
    href: "#",
    icon: (
      <Icon>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </Icon>
    ),
  },
  {
    label: "Báo cáo & thống kê",
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
  {
    label: "Cấu hình hệ thống",
    href: "#",
    icon: (
      <Icon>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </Icon>
    ),
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  useEffect(() => {
    (window as HSWindow).HSOverlay?.close(`#${ADMIN_SIDEBAR_ID}`);
  }, [pathname]);

  return (
    <div
      id={ADMIN_SIDEBAR_ID}
      className="hs-overlay fixed inset-y-0 start-0 z-60 hidden h-full w-64 -translate-x-full transform border-e border-sidebar-line bg-sidebar transition-all duration-300 [--auto-close:lg] hs-overlay-open:translate-x-0 lg:end-auto lg:bottom-0 lg:block lg:translate-x-0"
      role="dialog"
      tabIndex={-1}
      aria-label="Menu quản trị"
    >
      <div className="relative flex h-full max-h-full flex-col">
        <header className="flex items-center justify-between gap-x-2 p-4">
          <Link
            href="/"
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
              data-hs-overlay={`#${ADMIN_SIDEBAR_ID}`}
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
          <div className="flex w-full flex-col flex-wrap px-2 pb-0">
            <ul className="flex flex-col space-y-1">
              {navigation.map((item) => {
                const active =
                  item.href !== "#" &&
                  (pathname === item.href ||
                    (item.href !== "/admin" &&
                      pathname.startsWith(`${item.href}/`)));

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-x-3.5 rounded-lg px-2.5 py-2 text-sm text-sidebar-nav-foreground hover:bg-sidebar-nav-hover focus:bg-sidebar-nav-focus focus:outline-hidden ${
                        active ? "bg-sidebar-nav-active" : ""
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
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
