"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const buttonClass =
  "inline-flex items-center justify-center bg-new-coral hover:bg-new-coral-hover text-white px-5 py-2 rounded-lg font-semibold text-sm transition duration-150 shadow-sm";

export function HeaderAuthButton({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();

  if (isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className={buttonClass}
      >
        Đăng xuất
      </button>
    );
  }

  const isLoginPage = pathname === "/sign-in";

  return (
    <Link
      className={buttonClass}
      href={isLoginPage ? "/sign-up" : "/sign-in"}
    >
      {isLoginPage ? "Đăng ký" : "Đăng nhập"}
    </Link>
  );
}
