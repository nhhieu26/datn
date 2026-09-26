"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function AdminLoginForm() {
  const router = useRouter();
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
    <main className="flex min-h-dvh items-center justify-center bg-slate-950 px-4">
      <form
        className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-xl"
        onSubmit={handleSubmit}
      >
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Đăng nhập quản trị
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Dành riêng cho quản trị viên Roamly.
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        <div>
          <label
            className="mb-1 block text-xs font-medium text-slate-500"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            id="email"
            name="email"
            required
            type="email"
          />
        </div>

        <div>
          <label
            className="mb-1 block text-xs font-medium text-slate-500"
            htmlFor="password"
          >
            Mật khẩu
          </label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            id="password"
            name="password"
            required
            type="password"
          />
        </div>

        <button
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </main>
  );
}
