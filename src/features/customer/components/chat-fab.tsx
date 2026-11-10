"use client";

import { SparklesIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Các trang đã có khung chat thì không cần nút
const HIDDEN_PREFIXES = ["/chat", "/trip-planner"];

export function ChatFab() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed right-4 bottom-4 z-[1000] sm:right-6 sm:bottom-6"
      initial={{ opacity: 0, scale: 0.7, y: 16 }}
      transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.25 }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <Link
          aria-label="Trò chuyện với Roamly AI"
          className="group relative flex size-14 items-center justify-center rounded-full bg-new-teal-cta text-white shadow-lg shadow-new-teal-cta/30 transition-all hover:scale-105 hover:bg-new-teal-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-new-teal-cta/40"
          href="/chat"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-new-teal-cta/35 animate-ping [animation-duration:2.8s]"
          />
          <SparklesIcon className="relative z-10 size-6 transition-transform duration-300 group-hover:rotate-12" />
          <span className="pointer-events-none absolute right-full mr-3 translate-x-1.5 whitespace-nowrap rounded bg-new-title px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-md transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
            Hỏi Roamly AI
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}
