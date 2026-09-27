"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export function CustomerAccountHeader({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  const displayName = user.name || user.email || "Khách hàng";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="z-20 flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 sm:px-8">
      <Link
        href="/"
        className="flex h-9 items-center lg:hidden"
        aria-label="Roamly"
      >
        <Image
          src="/logo.png"
          alt="Roamly"
          width={2172}
          height={724}
          priority
          className="h-auto w-[110px]"
        />
      </Link>

      <div className="hidden max-w-xl flex-1 sm:block">
        <div className="relative w-full">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Tìm điểm đến, tour, khách sạn..."
            className="w-full rounded-full border border-slate-200/80 bg-slate-50 py-2.5 pl-11 pr-4 text-xs text-slate-700 transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          aria-label="Thông báo"
          className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          aria-label="Đăng xuất"
          title="Đăng xuất"
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-brand-600"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex cursor-pointer items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white shadow-sm ring-1 ring-slate-200">
            {initial}
          </div>
          <span className="hidden max-w-[140px] truncate text-xs font-semibold text-slate-800 sm:inline">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
}
