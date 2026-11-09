"use client";

import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Các trang đã có khung chat thì không cần nút
const HIDDEN_PREFIXES = ["/chat", "/trip-planner"];

export function ChatFab() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  return (
    <Link
      aria-label="Trò chuyện với Roamly AI"
      className="group fixed right-4 bottom-4 z-[1000] flex size-14 items-center justify-center rounded-full bg-new-teal-cta text-white shadow-lg shadow-new-teal-cta/30 transition-all hover:scale-105 hover:bg-new-teal-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-new-teal-cta/40 sm:right-6 sm:bottom-6"
      href="/chat"
    >
      <SparklesIcon className="size-6" />
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded bg-new-title px-3 py-1.5 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        Hỏi Roamly AI
      </span>
    </Link>
  );
}
