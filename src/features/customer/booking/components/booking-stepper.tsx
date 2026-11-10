"use client";

import { motion } from "motion/react";

export function BookingStepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  const lastIndex = steps.length - 1;
  return (
    <ol className="mx-auto mt-8 flex max-w-2xl">
      {steps.map((label, i) => {
        const done = i < current || current === lastIndex;
        const active = i === current;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className="flex flex-1 flex-col items-center gap-3 text-center"
          >
            <span
              className={`text-sm transition-colors duration-200 ${active ? "font-bold text-new-title" : "text-new-paragraph"}`}
            >
              {label}
            </span>
            <span className="relative flex w-full justify-center">
              {i < lastIndex && (
                <span
                  aria-hidden
                  className="absolute top-1/2 left-1/2 h-0.5 w-full -translate-y-1/2 overflow-hidden bg-new-track"
                >
                  <motion.span
                    animate={{ scaleX: i < current ? 1 : 0 }}
                    className="block h-full w-full origin-left bg-new-teal"
                    initial={{ scaleX: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              )}
              <motion.span
                animate={{ scale: active ? 1.08 : 1 }}
                className={`relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors duration-200 ${
                  done
                    ? "border-new-teal bg-new-teal text-white"
                    : active
                      ? "border-new-teal bg-white text-new-teal shadow-sm"
                      : "border-new-track bg-white text-new-paragraph"
                }`}
                transition={{ type: "spring", stiffness: 360, damping: 24 }}
              >
                {done ? (
                  <motion.span
                    animate={{ scale: 1, opacity: 1 }}
                    aria-hidden
                    className="material-symbols-outlined text-lg"
                    initial={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  >
                    check
                  </motion.span>
                ) : (
                  i + 1
                )}
              </motion.span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
