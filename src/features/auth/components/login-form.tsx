"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { PasswordEyeIcon } from "@/features/customer/components/password-eye-icon";

type AccountType = "customer" | "provider";

const ACCOUNT_TABS: { id: AccountType; label: string }[] = [
  { id: "customer", label: "Khách hàng" },
  { id: "provider", label: "Nhà cung cấp" },
];

const INPUT_CLASS =
  "block w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-new-teal focus:border-new-teal transition-all";

const DEV_CREDENTIALS =
  process.env.NODE_ENV === "development"
    ? {
        customer: {
          email: "messi@roamly.com",
          password: "Password123",
        },
        provider: { email: "neymar@roamly.com", password: "Password123" },
      }
    : null;

export function LoginForm() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      role: accountType,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Email, mật khẩu hoặc vai trò không đúng.");
      return;
    }

    router.push(accountType === "provider" ? "/provider" : "/");
  }

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
          className="space-y-5"
          key={DEV_CREDENTIALS ? accountType : undefined}
          onSubmit={handleSubmit}
        >
          {error && (
            <p className="rounded-lg bg-rose-50 px-4 py-2.5 text-[13px] text-rose-600">
              {error}
            </p>
          )}

          <div>
            <label
              className="block text-sm font-semibold text-gray-700 mb-1.5"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className={INPUT_CLASS}
              defaultValue={DEV_CREDENTIALS?.[accountType]?.email}
              id="email"
              name="email"
              placeholder="Nhập email của bạn"
              required
              type="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className="block text-sm font-semibold text-gray-700"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <Link
                className="text-xs font-medium text-new-teal hover:underline focus:outline-none"
                href="#"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <input
                className={`${INPUT_CLASS} pr-11`}
                defaultValue={DEV_CREDENTIALS?.[accountType]?.password}
                id="password"
                name="password"
                placeholder="Nhập mật khẩu của bạn"
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
          </div>

          <div className="pt-2">
            <button
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-lg text-sm font-semibold text-white bg-new-teal hover:bg-new-teal-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-new-teal shadow-sm transition-colors disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link
            className="font-semibold text-new-teal hover:underline"
            href="/sign-up"
          >
            Đăng ký
          </Link>
        </p>
      </div>
    </main>
  );
}
