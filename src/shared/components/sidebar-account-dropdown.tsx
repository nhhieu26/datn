"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import type { ReactNode } from "react";

type AccountLink = {
  label: string;
  href: string;
  icon: ReactNode;
};

const itemClass =
  "flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:bg-dropdown-item-focus focus:outline-hidden";

/** Dropdown tài khoản đặt ở chân sidebar theo phong cách Preline. */
export function SidebarAccountDropdown({
  id,
  name,
  email,
  roleLabel,
  links = [],
  signOutUrl,
}: {
  id: string;
  name: string;
  email?: string | null;
  roleLabel: string;
  links?: AccountLink[];
  signOutUrl: string;
}) {
  return (
    <footer className="mt-auto border-t border-sidebar-line p-2">
      <div className="hs-dropdown relative inline-flex w-full [--auto-close:inside] [--offset:8] [--placement:top-left] [--strategy:absolute]">
        <button
          id={id}
          type="button"
          className="inline-flex w-full shrink-0 items-center gap-x-2.5 rounded-lg p-2 text-start text-sm text-sidebar-nav-foreground hover:bg-sidebar-nav-hover focus:bg-sidebar-nav-focus focus:outline-hidden"
          aria-haspopup="menu"
          aria-expanded="false"
          aria-label="Tài khoản"
        >
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 grow">
            <span className="block truncate font-medium text-foreground">
              {name}
            </span>
            <span className="block truncate text-xs text-muted-foreground-1">
              {roleLabel}
            </span>
          </span>
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
          className="hs-dropdown-menu duration z-20 hidden w-60 rounded-lg border border-dropdown-line bg-dropdown opacity-0 shadow-lg transition-[opacity,margin] hs-dropdown-open:opacity-100"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={id}
        >
          <div className="rounded-t-lg bg-muted px-4 py-3">
            <p className="text-sm text-muted-foreground-1">{roleLabel}</p>
            <p className="truncate text-sm font-medium text-foreground">
              {email || name}
            </p>
          </div>
          <div className="space-y-0.5 p-1.5">
            {links.map((link) => (
              <Link key={link.href} className={itemClass} href={link.href}>
                {link.icon}
                {link.label}
              </Link>
            ))}
            <button
              className={itemClass}
              onClick={() => signOut({ callbackUrl: signOutUrl })}
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
    </footer>
  );
}
