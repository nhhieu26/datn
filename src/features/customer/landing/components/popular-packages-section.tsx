"use client";

import { ExploreCard } from "@/features/customer/components/cards";
import { FadeIn } from "@/features/customer/components/motion";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import {
  PACKAGE_COPY,
  PACKAGE_TABS,
  type PackageCopy,
} from "../lib/package-copy";
import type { PackageKind, PackagesByKind } from "../lib/package-types";

type PopularPackagesSectionProps = {
  packages: PackagesByKind;
  /** tiêu đề theo từng tab, mặc định là "phổ biến" */
  copyByKind?: Record<PackageKind, PackageCopy>;
  /** ẩn tab không có mục nào (dùng cho khu gợi ý) */
  hideEmptyTabs?: boolean;
  /** phân biệt hiệu ứng tab khi có nhiều section trên cùng trang */
  id?: string;
};

export function PopularPackagesSection({
  packages,
  copyByKind = PACKAGE_COPY,
  hideEmptyTabs = false,
  id = "popular-packages",
}: PopularPackagesSectionProps) {
  const tabs = hideEmptyTabs
    ? PACKAGE_TABS.filter((tab) => packages[tab.kind].length > 0)
    : PACKAGE_TABS;
  const [activeKind, setActiveKind] = useState<PackageKind>(
    tabs[0]?.kind ?? "tour",
  );
  const copy = copyByKind[activeKind];
  const itemCount = packages[activeKind].length;

  return (
    <section
      className="w-full relative z-20 py-16 page-x bg-white"
      data-purpose={id}
    >
      <div className="text-center">
        <FadeIn className="mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeKind}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-handwriting text-3xl font-bold tracking-wide mb-2 text-new-coral">
                {copy.script}
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-gray-900 tracking-tight leading-tight max-w-2xl mx-auto">
                {copy.heading}
              </h2>
            </motion.div>
          </AnimatePresence>
        </FadeIn>

        <FadeIn
          className="flex items-center justify-center flex-wrap gap-3 mb-12"
          delay={0.08}
        >
          {tabs.map((tab) => {
            const active = tab.kind === activeKind;
            return (
              <button
                key={tab.kind}
                aria-pressed={active}
                className={
                  active
                    ? "relative px-7 py-2.5 rounded-lg text-sm font-semibold transition-colors text-white cursor-pointer"
                    : "relative px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 cursor-pointer"
                }
                onClick={() => setActiveKind(tab.kind)}
                type="button"
              >
                {active && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-lg bg-new-teal-active shadow-sm"
                    layoutId={`${id}-tab`}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </FadeIn>

        <AnimatePresence mode="wait">
          {itemCount > 0 ? (
            <motion.div
              key={activeKind}
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left mb-12"
              exit={{ opacity: 0, y: 10, transition: { duration: 0.16 } }}
              initial="hidden"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.07, delayChildren: 0.02 },
                },
              }}
            >
              {packages[activeKind].map((item) => (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  <ExploreCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.p
              key={`${activeKind}-empty`}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-500 mb-12"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
            >
              Chưa có dữ liệu để hiển thị.
            </motion.p>
          )}
        </AnimatePresence>

        <FadeIn className="flex justify-center" delay={0.1}>
          <Link
            className="group inline-flex items-center gap-2 bg-new-teal hover:bg-new-teal-hover text-white px-8 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            href={`/explore?kind=${activeKind}`}
          >
            <span>{copy.cta}</span>
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M7 17L17 7M17 7H7M17 7V17"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
