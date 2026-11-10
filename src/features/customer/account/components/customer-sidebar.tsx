"use client";

import type { Tag } from "@/entities/tag";
import { FadeIn } from "@/features/customer/components/motion";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { InterestsModal } from "./interests-modal";

const navigation = [
  { label: "Hồ sơ của tôi", icon: "person", href: "/profile" },
  { label: "Đơn đặt tour", icon: "tour", href: "/my-bookings" },
  { label: "Đơn đặt phòng", icon: "hotel", href: "/my-hotel-bookings" },
  { label: "Đơn đặt bàn", icon: "restaurant", href: "/my-restaurant-bookings" },
];

export function CustomerSidebar({
  fullname,
  tags,
  selectedTags,
}: {
  fullname: string;
  tags: Tag[];
  selectedTags: string[];
}) {
  const pathname = usePathname();
  const [interestsOpen, setInterestsOpen] = useState(false);
  const initial = fullname.charAt(0).toUpperCase();

  return (
    <FadeIn
      className="hidden w-[320px] shrink-0 self-start rounded-md bg-new-section-bg p-6 lg:block"
      duration={0.45}
      inView={false}
      x={-16}
      y={8}
    >
      <div className="mb-[30px] flex items-center gap-2.5">
        <div className="flex h-[100px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded bg-white text-3xl font-semibold text-new-teal-cta">
          {initial}
        </div>
        <div>
          <h5 className="mb-1.5 text-lg font-semibold capitalize leading-tight text-new-title">
            {fullname}
          </h5>
          <button
            type="button"
            onClick={() => setInterestsOpen(true)}
            className="flex cursor-pointer items-center gap-1 text-sm font-medium capitalize text-new-teal-cta transition-opacity hover:opacity-80"
          >
            cập nhật sở thích
            <span className="material-symbols-outlined text-base">edit</span>
          </button>
        </div>
      </div>

      <nav aria-label="Menu tài khoản" className="text-base font-medium">
        {navigation.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex items-center gap-2 rounded px-2.5 py-2 transition-colors ${
                active
                  ? "text-new-teal-cta font-semibold"
                  : "text-new-title hover:text-new-teal-cta"
              }`}
            >
              {active && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded bg-white shadow-xs"
                  layoutId="account-sidebar-active"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span
                className={`relative z-10 material-symbols-outlined text-lg! leading-none ${
                  active ? "text-new-teal-cta!" : "text-new-paragraph!"
                }`}
              >
                {item.icon}
              </span>
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <AnimatePresence>
        {interestsOpen && (
          <InterestsModal
            onClose={() => setInterestsOpen(false)}
            onSaved={() => setInterestsOpen(false)}
            tags={tags}
            selectedTags={selectedTags}
          />
        )}
      </AnimatePresence>
    </FadeIn>
  );
}
