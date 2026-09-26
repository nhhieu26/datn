"use client";

import { signOut } from "next-auth/react";

export function AdminHeader() {
  return (
    <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-5 sm:px-8">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="material-symbols-outlined text-[20px] text-brand-500 xl:hidden">
          shield_person
        </span>
        <span className="hidden sm:inline">Quản trị</span>
        <span className="hidden text-slate-300 sm:inline">/</span>
        <span className="font-bold text-slate-900">Duyệt hồ sơ đối tác</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          type="button"
          aria-label="Thông báo"
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
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>
        <button
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-brand-600"
          onClick={() => signOut({ callbackUrl: "/admin/sign-in" })}
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
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white shadow-sm ring-2 ring-brand-100">
            AD
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-bold text-slate-900">Admin Roamly</p>
            <p className="text-[10px] text-slate-500">Quản trị viên</p>
          </div>
        </div>
      </div>
    </header>
  );
}
