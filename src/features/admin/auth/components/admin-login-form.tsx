"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

const FIELD_CLASS =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 focus:outline-none";

export function AdminLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: "admin",
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Email hoặc mật khẩu không đúng.");
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 text-slate-800">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-brand-orange/10 blur-3xl" />

      <form
        className="relative w-full max-w-[420px] space-y-4 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-900/5"
        onSubmit={handleSubmit}
      >
        {error && (
          <p className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </p>
        )}

        <div className="relative flex items-center">
          <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-[20px] text-slate-400">
            mail
          </span>
          <input
            autoComplete="username"
            className={FIELD_CLASS}
            id="email"
            name="email"
            placeholder="Email"
            required
            type="email"
          />
        </div>

        <div className="relative flex items-center">
          <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-[20px] text-slate-400">
            lock
          </span>
          <input
            autoComplete="current-password"
            className={`${FIELD_CLASS} pr-11`}
            id="password"
            name="password"
            placeholder="Mật khẩu"
            required
            type={showPassword ? "text" : "password"}
          />
          <button
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition hover:text-slate-600"
            onClick={() => setShowPassword((value) => !value)}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-orange py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              isSubmitting ? "animate-spin" : ""
            }`}
          >
            {isSubmitting ? "progress_activity" : "login"}
          </span>
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </main>
  );
}
