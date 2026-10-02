"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  registerAction,
  type RegisterActionState,
} from "@/features/auth/actions";
import { PasswordEyeIcon } from "@/features/customer/components/password-eye-icon";

const INITIAL_STATE: RegisterActionState = { status: "idle" };

type AccountType = "customer" | "provider";

const ACCOUNT_TABS: { id: AccountType; label: string }[] = [
  { id: "customer", label: "Khách hàng" },
  { id: "provider", label: "Nhà cung cấp" },
];

const INPUT_CLASS =
  "block w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-new-teal focus:border-new-teal transition-all";

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
        router.push(accountType === "provider" ? "/provider" : "/profile");
      })
      .finally(() => setIsSigningIn(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Roamly"
            className="h-10 w-auto object-contain mx-auto"
            src="/logo.png"
          />
        </div>

        <div className="flex items-center p-1 bg-gray-100 rounded-lg mb-6">
          {ACCOUNT_TABS.map((tab) => {
            const active = accountType === tab.id;
            return (
              <button
                className={
                  active
                    ? "flex-1 py-2 text-xs font-semibold rounded-md bg-new-teal text-white shadow-sm transition-all focus:outline-none"
                    : "flex-1 py-2 text-xs font-semibold rounded-md text-gray-600 hover:text-gray-900 transition-all focus:outline-none"
                }
                key={tab.id}
                onClick={() => setAccountType(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <form
          action={formAction}
          className="space-y-5"
          onSubmit={handleSubmit}
        >
          <input name="role" type="hidden" value={accountType} />

          {state.status === "error" && state.formError && (
            <p className="rounded-lg bg-rose-50 px-4 py-2.5 text-[13px] text-rose-600">
              {state.formError}
            </p>
          )}
          {signInError && (
            <p className="rounded-lg bg-rose-50 px-4 py-2.5 text-[13px] text-rose-600">
              {signInError}
            </p>
          )}

          <div>
            <label
              className="block text-sm font-semibold text-gray-700 mb-1.5"
              htmlFor="fullname"
            >
              Họ và tên / Tên đơn vị đại diện
            </label>
            <input
              className={INPUT_CLASS}
              id="fullname"
              name="fullname"
              placeholder="Nhập họ và tên hoặc tên doanh nghiệp của bạn"
              required
              type="text"
            />
            {state.fieldErrors?.fullname && (
              <p className="mt-1 ml-1 text-[11.5px] text-rose-500">
                {state.fieldErrors.fullname[0]}
              </p>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-gray-700 mb-1.5"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className={INPUT_CLASS}
              id="email"
              name="email"
              placeholder="Nhập email của bạn"
              ref={emailRef}
              required
              type="email"
            />
            {state.fieldErrors?.email && (
              <p className="mt-1 ml-1 text-[11.5px] text-rose-500">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-gray-700 mb-1.5"
              htmlFor="phone"
            >
              Số điện thoại
            </label>
            <input
              className={INPUT_CLASS}
              id="phone"
              name="phone"
              placeholder="Nhập số điện thoại của bạn"
              required
              type="tel"
            />
            {state.fieldErrors?.phone && (
              <p className="mt-1 ml-1 text-[11.5px] text-rose-500">
                {state.fieldErrors.phone[0]}
              </p>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-gray-700 mb-1.5"
              htmlFor="password"
            >
              Mật khẩu
            </label>
            <div className="relative">
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
                aria-label="Hiện/ẩn mật khẩu"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
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
              <p className="text-[11.5px] text-gray-400 mt-1.5 ml-1">
                Mật khẩu phải có ít nhất 8 ký tự.
              </p>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-gray-700 mb-1.5"
              htmlFor="confirm-password"
            >
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                className={`${INPUT_CLASS} pr-11`}
                id="confirm-password"
                name="confirm_password"
                placeholder="Nhập lại mật khẩu"
                required
                type={showConfirm ? "text" : "password"}
              />
              <button
                aria-label="Hiện/ẩn mật khẩu"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
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

          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-new-teal focus:ring-new-teal focus:ring-offset-0"
                required
                type="checkbox"
              />
              <span className="text-xs leading-relaxed text-gray-600">
                Tôi đồng ý với{" "}
                <Link
                  className="font-medium text-gray-900 underline hover:text-black"
                  href="#"
                >
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link
                  className="font-medium text-gray-900 underline hover:text-black"
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
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-lg text-sm font-semibold text-white bg-new-teal hover:bg-new-teal-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-new-teal shadow-sm transition-colors disabled:opacity-60"
              disabled={isPending || isSigningIn}
              type="submit"
            >
              {isPending || isSigningIn ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <Link
            className="font-semibold text-new-teal hover:underline"
            href="/sign-in"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}
