"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const buttonClass =
  "bg-[#111827] hover:bg-black text-white text-xs md:text-sm font-semibold px-5 py-2.5 rounded-full transition shadow-sm";

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
