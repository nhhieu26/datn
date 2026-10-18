"use client";

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

export function ProviderHeader() {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

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
            ),
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
        </div>
      </nav>
    </header>
  );
}
