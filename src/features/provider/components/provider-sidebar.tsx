"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SidebarAccountDropdown } from "@/shared/components/sidebar-account-dropdown";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";

export const PROVIDER_SIDEBAR_ID = "hs-provider-sidebar";

type HSWindow = Window & {
  HSOverlay?: { close: (target: string) => void };
};

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

type ServiceKey = "tour" | "hotel" | "restaurant";

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

const SERVICE_TYPES: {
  key: ServiceKey;
  slug: string;
  label: string;
  bookingLabel: string;
  icon: ReactNode;
}[] = [
  {
    key: "tour",
    slug: "tours",
    label: "Tour",
    bookingLabel: "Đặt tour",
    icon: (
      <Icon>
        <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
        <path d="M15 5.764v15" />
        <path d="M9 3.236v15" />
      </Icon>
    ),
  },
  {
    key: "hotel",
    slug: "hotels",
    label: "Khách sạn",
    bookingLabel: "Đặt phòng",
    icon: (
      <Icon>
        <path d="M2 4v16" />
        <path d="M2 8h18a2 2 0 0 1 2 2v10" />
        <path d="M2 17h20" />
        <path d="M6 8v9" />
      </Icon>
    ),
  },
  {
    key: "restaurant",
    slug: "restaurants",
    label: "Nhà hàng",
    bookingLabel: "Đặt bàn",
    icon: (
      <Icon>
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </Icon>
    ),
  },
];

const STORAGE_KEY = "provider-active-service";
const SERVICE_SEGMENT = /^\/provider\/(?:(?:bookings|reviews)\/)?(tours|hotels|restaurants)(?:\/|$)/;

const PROFILES_PATH = "/provider/profiles";

function isServiceKey(value: string | null): value is ServiceKey {
  return SERVICE_TYPES.some((s) => s.key === value);
}

// Trang hồ sơ không có segment loại dịch vụ trong đường dẫn nên dùng ?type=.
function getServiceFromPath(
  pathname: string,
  typeParam: string | null,
): ServiceKey | null {
  if (pathname === PROFILES_PATH || pathname.startsWith(`${PROFILES_PATH}/`)) {
    return isServiceKey(typeParam) ? typeParam : null;
  }
  const slug = SERVICE_SEGMENT.exec(pathname)?.[1];
  return SERVICE_TYPES.find((s) => s.slug === slug)?.key ?? null;
}

// Giữ nguyên mục hiện tại (danh sách / đơn đặt / đánh giá) khi đổi loại dịch vụ.
function switchHref(pathname: string, service: (typeof SERVICE_TYPES)[number]) {
  const { slug } = service;
  if (pathname === PROFILES_PATH) return `${PROFILES_PATH}?type=${service.key}`;
  const section = /^\/provider\/(bookings|reviews)\//.exec(pathname)?.[1];
  return section ? `/provider/${section}/${slug}` : `/provider/${slug}`;
}

function readStoredService(): ServiceKey {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (SERVICE_TYPES.some((s) => s.key === value)) return value as ServiceKey;
  } catch {}
  return "tour";
}

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function useActiveService(pathname: string): ServiceKey {
  const typeParam = useSearchParams().get("type");
  const fromPath = getServiceFromPath(pathname, typeParam);
  const stored = useSyncExternalStore(
    subscribeStorage,
    readStoredService,
    () => "tour" as ServiceKey,
  );

  useEffect(() => {
    if (!fromPath) return;
    try {
      localStorage.setItem(STORAGE_KEY, fromPath);
    } catch {}
  }, [fromPath]);

  return fromPath ?? stored;
}

const dashboardItem: NavItem = {
  label: "Bảng điều khiển",
  href: "#",
  icon: (
    <Icon>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </Icon>
  ),
};

const profileItem: NavItem = {
  label: "Hồ sơ doanh nghiệp",
  href: PROFILES_PATH,
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
};

const reportItem: NavItem = {
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
};

function buildNavItems(service: (typeof SERVICE_TYPES)[number]): NavItem[] {
  return [
    dashboardItem,
    {
      label: `Quản lý ${service.label.toLowerCase()}`,
      href: `/provider/${service.slug}`,
      icon: (
        <Icon>
          <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
          <path d="M12 22V12" />
          <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
          <path d="m7.5 4.27 9 5.15" />
        </Icon>
      ),
    },
    {
      label: service.bookingLabel,
      href: `/provider/bookings/${service.slug}`,
      icon: (
        <Icon>
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
        </Icon>
      ),
    },
    {
      label: "Đánh giá",
      href: `/provider/reviews/${service.slug}`,
      icon: (
        <Icon>
          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
        </Icon>
      ),
    },
    { ...profileItem, href: `${PROFILES_PATH}?type=${service.key}` },
    reportItem,
  ];
}

const navLinkClass =
  "flex w-full items-center gap-x-3.5 rounded-lg px-2.5 py-2 text-start text-sm text-sidebar-nav-foreground hover:bg-sidebar-nav-hover focus:bg-sidebar-nav-focus focus:outline-hidden";

function isActive(pathname: string, href: string) {
  const path = href.split("?")[0];
  return path !== "#" && (pathname === path || pathname.startsWith(`${path}/`));
}

export function ProviderSidebar({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  const pathname = usePathname();
  const name = user.name || user.email || "Đối tác";
  const activeKey = useActiveService(pathname);
  const activeService =
    SERVICE_TYPES.find((s) => s.key === activeKey) ?? SERVICE_TYPES[0];
  const navItems = buildNavItems(activeService);

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

        <div className="px-4 pb-3">
          <p className="mb-1.5 px-1 text-xs font-medium uppercase text-muted-foreground-1">
            Loại dịch vụ
          </p>
          <div className="hs-dropdown relative inline-flex w-full [--auto-close:inside] [--offset:6] [--placement:bottom-left] [--strategy:absolute]">
            <button
              id="hs-provider-service-switcher"
              type="button"
              className="inline-flex w-full items-center gap-x-2.5 rounded-lg border border-layer-line bg-layer px-3 py-2 text-start text-sm font-medium text-sidebar-nav-foreground hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="Chuyển loại dịch vụ"
            >
              {activeService.icon}
              <span className="min-w-0 grow truncate">{activeService.label}</span>
              <svg
                className="ms-auto size-3.5 shrink-0"
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
                <path d="m7 15 5 5 5-5" />
                <path d="m7 9 5-5 5 5" />
              </svg>
            </button>

            <div
              className="hs-dropdown-menu z-20 hidden w-full min-w-48 rounded-lg border border-dropdown-line bg-dropdown p-1.5 opacity-0 shadow-lg transition-[opacity,margin] hs-dropdown-open:opacity-100"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="hs-provider-service-switcher"
            >
              <div className="space-y-0.5">
                {SERVICE_TYPES.map((service) => {
                  const active = service.key === activeKey;
                  return (
                    <Link
                      key={service.key}
                      href={switchHref(pathname, service)}
                      role="menuitem"
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:bg-dropdown-item-focus focus:outline-hidden ${
                        active ? "bg-dropdown-item-hover font-medium" : ""
                      }`}
                    >
                      {service.icon}
                      <span className="grow">{service.label}</span>
                      {active && (
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
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb [&::-webkit-scrollbar-track]:bg-scrollbar-track">
          <div className="flex w-full flex-col flex-wrap px-2 pb-0">
            <ul className="flex flex-col space-y-1">
              {navItems.map((item) => {
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
              })}
            </ul>
          </div>
        </nav>

        <SidebarAccountDropdown
          id="hs-provider-account-dropdown"
          name={name}
          email={user.email}
          roleLabel="Nhà cung cấp"
          links={[
            {
              label: "Hồ sơ doanh nghiệp",
              href: `${PROFILES_PATH}?type=${activeKey}`,
              icon: profileItem.icon,
            },
          ]}
          signOutUrl="/sign-in"
        />
      </div>
    </div>
  );
}
