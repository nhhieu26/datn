"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_SIDEBAR_ID } from "./admin-sidebar";

const crumbLabels: Record<string, string> = {
  "/admin": "Quản trị",
  "/admin/profile-approval": "Duyệt hồ sơ đối tác",
  "/admin/destinations": "Quản lý địa điểm",
  "/admin/destinations/create": "Tạo mới",
};

function buildCrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts
    .map((_, index) => `/${parts.slice(0, index + 1).join("/")}`)
    .filter((href) => href in crumbLabels)
    .map((href) => ({ href, label: crumbLabels[href] }));
}

export function AdminHeader({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);
  const name = user.name || "Admin Roamly";

  return (
    <header className="z-48 flex font-inter w-full shrink-0 border-b border-navbar-line bg-navbar py-2.5 text-sm">
      <nav className="mx-auto flex w-full basis-full items-center gap-x-3 px-4 sm:px-6">
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer text-layer-foreground hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden lg:hidden"
          aria-haspopup="dialog"
          aria-expanded="false"
          aria-controls={ADMIN_SIDEBAR_ID}
          aria-label="Mở menu"
          data-hs-overlay={`#${ADMIN_SIDEBAR_ID}`}
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
              id="hs-admin-account-dropdown"
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
              aria-labelledby="hs-admin-account-dropdown"
            >
              <div className="rounded-t-lg bg-muted px-5 py-3">
                <p className="text-sm text-muted-foreground-1">Quản trị viên</p>
                <p className="truncate text-sm font-medium text-foreground">
                  {user.email || name}
                </p>
              </div>
              <div className="space-y-0.5 p-1.5">
                <button
                  className="flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:bg-dropdown-item-focus focus:outline-hidden"
                  onClick={() => signOut({ callbackUrl: "/admin/sign-in" })}
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
