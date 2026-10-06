"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Tag } from "@/entities/tag";
import { InterestsModal } from "./interests-modal";

const navigation = [
  { label: "Hồ sơ của tôi", icon: "person", href: "/profile" },
  { label: "Đơn đặt chỗ", icon: "event", href: "/my-bookings" },
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
    <aside className="hidden w-[320px] shrink-0 self-start rounded-md bg-new-section-bg p-6 lg:block">
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
            className="flex items-center gap-1 text-sm font-medium capitalize text-new-teal-cta"
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
              className={`flex items-center gap-2 py-2 transition-colors ${
                active
                  ? "text-new-teal-cta"
                  : "text-new-title hover:text-new-teal-cta"
              }`}
            >
              <span
                className={`material-symbols-outlined text-lg! leading-none ${
                  active ? "text-new-teal-cta!" : "text-new-paragraph!"
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {interestsOpen && (
        <InterestsModal
          onClose={() => setInterestsOpen(false)}
          onSaved={() => setInterestsOpen(false)}
          tags={tags}
          selectedTags={selectedTags}
        />
      )}
    </aside>
  );
}
