"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Tổng quan", icon: "space_dashboard", href: "/admin" },
  {
    label: "Duyệt hồ sơ đối tác",
    icon: "badge",
    href: "/admin/profile-approval",
    count: 3,
  },
  { label: "Duyệt dịch vụ", icon: "verified", href: "#", count: 8 },
  { label: "Quản lý người dùng", icon: "group", href: "#" },
  { label: "Báo cáo & thống kê", icon: "monitoring", href: "#" },
  { label: "Cấu hình hệ thống", icon: "settings", href: "#" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="z-30 hidden w-72 shrink-0 flex-col justify-between border-r border-slate-200/80 bg-white xl:flex">
      <div className="p-6">
        <Link href="/" className="mb-7 flex h-9 items-center" aria-label="Roamly">
          <Image
            src="/logo.png"
            alt="Roamly"
            width={2172}
            height={724}
            priority
            className="h-auto w-[145px]"
          />
        </Link>

        <div className="mb-6 flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-2.5 transition hover:bg-slate-100/70">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white shadow-sm ring-2 ring-white">
              AD
            </div>
            <div className="truncate leading-tight">
              <div className="truncate text-sm font-bold text-slate-900">
                Admin Roamly
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                Quản trị viên
              </div>
            </div>
          </div>
          <svg
            className="ml-1 h-4 w-4 shrink-0 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 5l7 7-7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </div>

        <nav aria-label="Menu quản trị" className="space-y-1.5">
          {navigation.map((item) => {
            const active =
              item.href !== "#" &&
              (pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href)));

            return (
              <Link
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition ${
                  active
                    ? "border border-brand-100 bg-brand-50 font-bold text-brand-600 shadow-sm"
                    : "font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
                href={item.href}
                key={item.label}
              >
                <span className="flex items-center gap-3.5">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      active ? "text-brand-500" : "text-slate-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </span>
                {item.count ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      active
                        ? "bg-brand-500 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-100 p-5">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
          <div className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-800">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Hệ thống hoạt động tốt</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            Dữ liệu kiểm duyệt được đồng bộ lần cuối lúc 10:42.
          </p>
        </div>
      </div>
    </aside>
  );
}
