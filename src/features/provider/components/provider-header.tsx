"use client";

import { signOut } from "next-auth/react";

export function ProviderHeader({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  const displayName = user.name || user.email || "Đối tác";
  const initial = displayName.charAt(0).toUpperCase();
  return (
    <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-8">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span>Trang chủ</span>
        <span className="text-slate-300">/</span>
        <span className="flex items-center gap-1.5 font-bold text-slate-900">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
          Quản lý Hồ sơ Doanh nghiệp
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
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
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>
        <button
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-brand-600"
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          type="button"
          aria-label="Đăng xuất"
          title="Đăng xuất"
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
        <div className="group flex cursor-pointer items-center gap-3 pl-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white shadow-sm ring-2 ring-slate-100">
            {initial}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900 transition group-hover:text-brand-600">
              {displayName}
            </div>
            <div className="text-[11px] text-slate-500">Nhà cung cấp</div>
          </div>
          <svg
            className="ml-1 h-4 w-4 text-slate-400 transition group-hover:text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M19 9l-7 7-7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </header>
  );
}
