"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  registerAction,
  type RegisterActionState,
} from "@/features/auth/actions";
import { PasswordEyeIcon } from "@/features/customer/components";

const INITIAL_STATE: RegisterActionState = { status: "idle" };

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

export function RegisterForm() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const submittedCredentials = useRef<{
    email: string;
    password: string;
  } | null>(null);
  const [state, formAction, isPending] = useActionState(
    registerAction,
    INITIAL_STATE,
  );

  function handleSubmit() {
    submittedCredentials.current = {
      email: emailRef.current?.value ?? "",
      password: passwordRef.current?.value ?? "",
    };
  }

  useEffect(() => {
    if (state.status !== "success") return;
    if (!submittedCredentials.current) return;

    const { email, password } = submittedCredentials.current;

    setIsSigningIn(true);
    signIn("credentials", {
      email,
      password,
      role: accountType,
      redirect: false,
    })
      .then((result) => {
        if (result?.error) {
          setSignInError("Đăng ký thành công, vui lòng đăng nhập lại.");
          router.push("/sign-in");
          return;
        }
        router.push("/");
      })
      .finally(() => setIsSigningIn(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <main className="flex-1 py-6 px-4 md:px-8 flex items-center justify-center">
      <div className="w-full max-w-7xl rounded-[32px] md:rounded-[44px] p-6 sm:p-12 lg:p-20 mesh-gradient-bg shadow-2xl relative overflow-hidden flex items-center justify-center min-h-[820px]">
        <div className="absolute -top-28 -left-28 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[480px] h-[480px] bg-rose-400/25 rounded-full blur-3xl pointer-events-none" />

        <section
          className="relative w-full max-w-[490px] bg-white rounded-[38px] px-8 py-10 sm:px-11 sm:py-11 shadow-2xl shadow-slate-950/20 border border-white/70"
          data-purpose="registration-card"
        >
          <header className="mb-7">
            <h1 className="text-[28px] leading-tight font-bold text-slate-900 tracking-tight">
              Tạo tài khoản mới
            </h1>
            <p className="mt-2 text-[14px] text-slate-500 font-normal">
              Đã có tài khoản?
              <Link
                className="font-semibold text-slate-900 hover:underline ml-1"
                href="/sign-in"
              >
                Đăng nhập
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
                ? "Đăng ký trải nghiệm tour, đặt phòng và dịch vụ du lịch tiện lợi"
                : "Đăng ký để đưa dịch vụ của bạn đến với hàng triệu du khách"}
            </p>
          </div>

          <form
            action={formAction}
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <input name="role" type="hidden" value={accountType} />

            {state.status === "error" && state.formError && (
              <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-[13px] text-rose-600">
                {state.formError}
              </p>
            )}
            {signInError && (
              <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-[13px] text-rose-600">
                {signInError}
              </p>
            )}

            <div data-purpose="input-group">
              <label
                className="block text-xs font-medium text-slate-500 mb-1.5 ml-1"
                htmlFor="fullname"
              >
                Họ và tên / Tên đơn vị đại diện
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
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <input
                  className={INPUT_CLASS}
                  id="fullname"
                  name="fullname"
                  placeholder="Nhập họ và tên hoặc tên doanh nghiệp của bạn"
                  required
                  type="text"
                />
              </div>
              {state.fieldErrors?.fullname && (
                <p className="mt-1 ml-1 text-[11.5px] text-rose-500">
                  {state.fieldErrors.fullname[0]}
                </p>
              )}
            </div>

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
                  ref={emailRef}
                  required
                  type="email"
                />
              </div>
              {state.fieldErrors?.email && (
                <p className="mt-1 ml-1 text-[11.5px] text-rose-500">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div data-purpose="input-group">
              <label
                className="block text-xs font-medium text-slate-500 mb-1.5 ml-1"
                htmlFor="phone"
              >
                Số điện thoại
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
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <input
                  className={INPUT_CLASS}
                  id="phone"
                  name="phone"
                  placeholder="Nhập số điện thoại của bạn"
                  required
                  type="tel"
                />
              </div>
              {state.fieldErrors?.phone && (
                <p className="mt-1 ml-1 text-[11.5px] text-rose-500">
                  {state.fieldErrors.phone[0]}
                </p>
              )}
            </div>

            <div data-purpose="input-group">
              <label
                className="block text-xs font-medium text-slate-500 mb-1.5 ml-1"
                htmlFor="confirm-password"
              >
                Xác nhận mật khẩu
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
                  id="confirm-password"
                  name="confirm_password"
                  placeholder="Nhập lại mật khẩu"
                  required
                  type={showConfirm ? "text" : "password"}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  onClick={() => setShowConfirm((value) => !value)}
                  type="button"
                >
                  <PasswordEyeIcon open={showConfirm} />
                </button>
              </div>
              {state.fieldErrors?.confirm_password && (
                <p className="mt-1 ml-1 text-[11.5px] text-rose-500">
                  {state.fieldErrors.confirm_password[0]}
                </p>
              )}
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
                  placeholder="Tạo mật khẩu mạnh"
                  ref={passwordRef}
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
              {state.fieldErrors?.password ? (
                <p className="mt-1 ml-1 text-[11.5px] text-rose-500">
                  {state.fieldErrors.password[0]}
                </p>
              ) : (
                <p className="text-[11.5px] text-slate-400 mt-1.5 ml-1">
                  Mật khẩu phải có ít nhất 8 ký tự.
                </p>
              )}
            </div>

            <div className="pt-2 pb-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 focus:ring-offset-0"
                  required
                  type="checkbox"
                />
                <span className="text-[12px] leading-relaxed text-slate-600">
                  Tôi đồng ý với{" "}
                  <Link
                    className="font-medium text-slate-900 underline hover:text-black"
                    href="#"
                  >
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link
                    className="font-medium text-slate-900 underline hover:text-black"
                    href="#"
                  >
                    Chính sách bảo mật
                  </Link>{" "}
                  của Roamly.
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button
                className="w-full bg-[#18181b] hover:bg-black text-white font-medium text-[15px] py-3.5 px-6 rounded-full shadow-lg shadow-black/10 hover:shadow-black/20 active:scale-[0.99] transition duration-150 disabled:opacity-60"
                disabled={isPending || isSigningIn}
                type="submit"
              >
                {isPending || isSigningIn ? "Đang xử lý..." : "Đăng ký"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
