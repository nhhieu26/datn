"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function HeaderAuthButton() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/dang-nhap";

  return (
    <Link
      className="bg-[#111827] hover:bg-black text-white text-xs md:text-sm font-semibold px-5 py-2.5 rounded-full transition shadow-sm"
      href={isLoginPage ? "/dang-ky" : "/dang-nhap"}
    >
      {isLoginPage ? "Đăng ký" : "Đăng nhập"}
    </Link>
  );
}
