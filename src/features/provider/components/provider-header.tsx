"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROVIDER_SIDEBAR_ID } from "./provider-sidebar";

const crumbLabels: Record<string, string> = {
  "/provider": "Kênh đối tác",
  "/provider/tours": "Tour du lịch",
  "/provider/hotels": "Khách sạn & Lưu trú",
  "/provider/restaurants": "Nhà hàng & Ẩm thực",
  "/provider/profiles": "Hồ sơ doanh nghiệp",
  "/provider/bookings/tours": "Đặt tour",
  "/provider/bookings/hotels": "Đặt phòng",
  "/provider/bookings/restaurants": "Đặt bàn",
};

function buildCrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { href: string; label: string }[] = [];

  parts.forEach((segment, index) => {
    const href = `/${parts.slice(0, index + 1).join("/")}`;
    if (href in crumbLabels) {
      crumbs.push({ href, label: crumbLabels[href] });
    } else if (segment === "create") {
      crumbs.push({ href, label: "Tạo mới" });
    } else if (segment === "edit") {
      crumbs.push({ href, label: "Chỉnh sửa" });
    } else if (index === parts.length - 1) {
      // Mã đơn đặt chỗ, ví dụ /provider/bookings/tours/[code]
      crumbs.push({ href, label: decodeURIComponent(segment) });
    }
  });

  return crumbs;
}

export function ProviderHeader({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);
  const name = user.name || user.email || "Đối tác";

  return (
    <header className="z-48 flex font-inter w-full shrink-0 border-b border-navbar-line bg-navbar py-2.5 text-sm">
      <nav className="mx-auto flex w-full basis-full items-center gap-x-3 px-4 sm:px-6">
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer text-layer-foreground hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden lg:hidden"
          aria-haspopup="dialog"
          aria-expanded="false"
          aria-controls={PROVIDER_SIDEBAR_ID}
          aria-label="Mở menu"
          data-hs-overlay={`#${PROVIDER_SIDEBAR_ID}`}
        >
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
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M15 3v18" />
            <path d="m8 9 3 3-3 3" />
          </svg>
        </button>

        <ol className="flex items-center whitespace-nowrap">
          {crumbs.map((crumb, index) =>
            index === crumbs.length - 1 ? (
              <li
                key={crumb.href}
                className="inline-flex items-center truncate text-sm font-semibold text-foreground"
                aria-current="page"
              >
                {crumb.label}
              </li>
            ) : (
              <li key={crumb.href} className="inline-flex items-center">
                <Link
                  className="flex items-center text-sm text-muted-foreground-1 hover:text-primary-focus focus:text-primary-focus focus:outline-hidden"
                  href={crumb.href}
                >
                  {crumb.label}
                </Link>
                <svg
                  className="mx-2 size-4 shrink-0 text-muted-foreground"
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
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </li>
            )
          )}
        </ol>

        <div className="ms-auto flex flex-row items-center justify-end gap-1">
          <button
            type="button"
            className="relative inline-flex size-9.5 items-center justify-center gap-x-2 rounded-full border border-transparent text-sm font-semibold text-foreground hover:bg-muted-hover focus:bg-muted-focus focus:outline-hidden"
            aria-label="Thông báo"
          >
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
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute end-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-navbar" />
          </button>

          <div className="hs-dropdown relative inline-flex [--placement:bottom-right]">
            <button
              id="hs-provider-account-dropdown"
              type="button"
              className="inline-flex size-9.5 items-center justify-center gap-x-2 rounded-full border border-transparent text-sm font-semibold text-foreground focus:outline-hidden"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="Tài khoản"
            >
              <span className="inline-flex size-9.5 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {name.charAt(0).toUpperCase()}
              </span>
            </button>

            <div
              className="hs-dropdown-menu duration z-10 mt-2 hidden min-w-60 rounded-lg border border-dropdown-line bg-dropdown opacity-0 shadow-md transition-[opacity,margin] hs-dropdown-open:opacity-100"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="hs-provider-account-dropdown"
            >
              <div className="rounded-t-lg bg-muted px-5 py-3">
                <p className="text-sm text-muted-foreground-1">Nhà cung cấp</p>
                <p className="truncate text-sm font-medium text-foreground">
                  {user.email || name}
                </p>
              </div>
              <div className="space-y-0.5 p-1.5">
                <Link
                  className="flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:bg-dropdown-item-focus focus:outline-hidden"
                  href="/provider/profiles"
                >
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
                    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                    <path d="M10 6h4" />
                    <path d="M10 10h4" />
                    <path d="M10 14h4" />
                    <path d="M10 18h4" />
                  </svg>
                  Hồ sơ doanh nghiệp
                </Link>
                <button
                  className="flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:bg-dropdown-item-focus focus:outline-hidden"
                  onClick={() => signOut({ callbackUrl: "/sign-in" })}
                  type="button"
                >
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
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
