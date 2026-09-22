"use client";

import Link from "next/link";
import { useState } from "react";
import { PasswordEyeIcon } from "@/features/khach-hang/components/password-eye-icon";

type AccountType = "customer" | "provider";

const ACCOUNT_TABS: { id: AccountType; label: string; icon: string }[] = [
  {
    id: "customer",
    label: "Khách hàng",
    icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
  },
  {
    id: "provider",
    label: "Nhà cung cấp",
    icon: "M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.25A2.25 2.25 0 0 1 0 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 18 7.5v11.25A2.25 2.25 0 0 1 15.75 21m-4.5 0h4.5M3.75 6.75h.008v.008H3.75V6.75Zm0 3.75h.008v.008H3.75V10.5Zm0 3.75h.008v.008H3.75V14.25Zm3.75-7.5h.008v.008H7.5V6.75Zm0 3.75h.008v.008H7.5V10.5Zm0 3.75h.008v.008H7.5V14.25Z",
  },
];

const INPUT_CLASS =
  "w-full bg-[#f6f7f9] border-0 focus:ring-2 focus:ring-slate-900 text-[14px] text-slate-900 placeholder:text-slate-400 rounded-2xl py-3 pl-11 pr-4 transition duration-150";

export function LoginForm() {
  const [accountType, setAccountType] = useState<AccountType>("customer");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="flex-1 py-6 px-4 md:px-8 flex items-center justify-center">
      <div className="w-full max-w-7xl rounded-[32px] md:rounded-[44px] p-6 sm:p-12 lg:p-20 mesh-gradient-bg shadow-2xl relative overflow-hidden flex items-center justify-center min-h-[820px]">
        <div className="absolute -top-28 -left-28 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[480px] h-[480px] bg-rose-400/25 rounded-full blur-3xl pointer-events-none" />

        <section
          className="relative w-full max-w-[490px] bg-white rounded-[38px] px-8 py-10 sm:px-11 sm:py-11 shadow-2xl shadow-slate-950/20 border border-white/70"
          data-purpose="login-card"
        >
          <header className="mb-7">
            <h1 className="text-[28px] leading-tight font-bold text-slate-900 tracking-tight">
              Đăng nhập
            </h1>
            <p className="mt-2 text-[14px] text-slate-500 font-normal">
              Chưa có tài khoản?
              <Link
                className="font-semibold text-slate-900 hover:underline ml-1"
                href="/dang-ky"
              >
                Đăng ký
              </Link>
            </p>
          </header>

          <div className="mb-6">
            <div className="bg-[#f6f7f9] p-1 rounded-2xl flex items-center gap-1 border border-slate-100">
              {ACCOUNT_TABS.map((tab) => {
                const active = accountType === tab.id;
                return (
                  <button
                    className={
                      active
                        ? "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white text-slate-900 shadow-sm text-[13px] font-semibold transition"
                        : "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-slate-500 hover:text-slate-800 text-[13px] font-medium transition"
                    }
                    key={tab.id}
                    onClick={() => setAccountType(tab.id)}
                    type="button"
                  >
                    <svg
                      className={
                        active
                          ? "w-4 h-4 text-slate-700"
                          : "w-4 h-4 text-slate-400"
                      }
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d={tab.icon}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-center text-[12px] text-slate-400">
              {accountType === "customer"
                ? "Đăng nhập để tiếp tục hành trình khám phá của bạn"
                : "Đăng nhập để quản lý dịch vụ và đơn đặt của bạn"}
            </p>
          </div>

          <form
            action="#"
            className="space-y-4"
            method="POST"
            onSubmit={(event) => event.preventDefault()}
          >
            <div data-purpose="input-group">
              <label
                className="block text-xs font-medium text-slate-500 mb-1.5 ml-1"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative flex items-center">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-[18px] h-[18px]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <input
                  className={INPUT_CLASS}
                  id="email"
                  name="email"
                  placeholder="ví dụ: hello@roamly.com"
                  required
                  type="email"
                />
              </div>
            </div>

            <div data-purpose="input-group">
              <label
                className="block text-xs font-medium text-slate-500 mb-1.5 ml-1"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <div className="relative flex items-center">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-[18px] h-[18px]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <input
                  className={`${INPUT_CLASS} pr-11`}
                  id="password"
                  name="password"
                  placeholder="Nhập mật khẩu của bạn"
                  required
                  type={showPassword ? "text" : "password"}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  <PasswordEyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 pb-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 focus:ring-offset-0"
                  type="checkbox"
                />
                <span className="text-[12px] text-slate-600">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <Link
                className="text-[12px] font-medium text-slate-900 hover:underline"
                href="#"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <div className="pt-2">
              <button
                className="w-full bg-[#18181b] hover:bg-black text-white font-medium text-[15px] py-3.5 px-6 rounded-full shadow-lg shadow-black/10 hover:shadow-black/20 active:scale-[0.99] transition duration-150"
                type="submit"
              >
                Đăng nhập
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
