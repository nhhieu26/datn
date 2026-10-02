import { auth } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { HeaderAuthButton } from "./header-auth-button";
import { HeaderNavLinks } from "./header-nav-links";

export async function MainHeader() {
  const session = await auth();

  return (
    <header
      className="w-full relative z-30 px-8 lg:px-16 bg-new-hero-bg"
      data-purpose="site-header"
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between h-20">
        <Link
          className="flex items-center"
          data-purpose="brand-logo"
          href="/"
        >
          <Image
            alt="Roamly Logo"
            className="h-10 w-auto object-contain"
            height={724}
            priority
            src="/logo.png"
            width={2172}
          />
        </Link>

        <HeaderNavLinks />

        <div
          className="flex items-center space-x-4 lg:space-x-5"
          data-purpose="header-actions"
        >
          <Link
            aria-label="Tìm kiếm"
            className="p-1.5 text-gray-800 hover:text-new-coral transition"
            href="/explore"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </Link>

          {session?.user && (
            <Link
              aria-label="Hồ sơ của tôi"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:text-new-coral transition"
              href="/profile"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0v.75H4.5v-.75z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </Link>
          )}

          <HeaderAuthButton isAuthenticated={!!session?.user} />
        </div>
      </div>
    </header>
  );
}
