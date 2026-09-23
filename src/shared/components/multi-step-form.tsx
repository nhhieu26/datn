"use client";

import { useState } from "react";
import Link from "next/link";

export type StepDefinition = {
  id: number;
  title: string;
  subtitle?: string;
};

export function useMultiStepForm(totalSteps: number, initialStep = 1) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const goTo = (step: number) => {
    setCurrentStep(Math.min(Math.max(step, 1), totalSteps));
  };

  return {
    currentStep,
    totalSteps,
    goTo,
    next: () => goTo(currentStep + 1),
    prev: () => goTo(currentStep - 1),
    isFirst: currentStep === 1,
    isLast: currentStep === totalSteps,
  };
}

export function StepperNav({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: StepDefinition[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}) {
  return (
    <ol className="flex items-start">
      {steps.map((step, index) => {
        const isDone = step.id < currentStep;
        const isActive = step.id === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <li className={`flex items-center ${isLast ? "" : "flex-1"}`} key={step.id}>
            <button
              className="flex flex-col items-center gap-1.5 text-center"
              onClick={() => onStepClick?.(step.id)}
              type="button"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                  isDone
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isActive
                      ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {isDone ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </span>
              <span className="max-w-[7.5rem]">
                <span
                  className={`block text-xs font-bold ${
                    isActive || isDone ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {step.title}
                </span>
                {step.subtitle ? (
                  <span className="block text-[11px] font-medium text-slate-400">
                    {step.subtitle}
                  </span>
                ) : null}
              </span>
            </button>
            {isLast ? null : (
              <div
                className={`mx-2 mt-[-1.25rem] h-0.5 flex-1 rounded-full ${
                  isDone ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function StepFooter({
  isFirst,
  isLast,
  onBack,
  onNext,
  cancelHref,
  backLabel = "Quay lại bước trước",
  nextLabel = "Tiếp tục",
  lastLabel = "Hoàn tất",
}: {
  isFirst: boolean;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
  cancelHref: string;
  backLabel?: string;
  nextLabel?: string;
  lastLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-5">
      {isFirst ? (
        <Link
          className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          href={cancelHref}
        >
          Hủy thao tác
        </Link>
      ) : (
        <button
          className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          onClick={onBack}
          type="button"
        >
          {backLabel}
        </button>
      )}
      <button
        className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/25 transition-all hover:bg-brand-600 active:scale-95"
        onClick={onNext}
        type="button"
      >
        {isLast ? lastLabel : nextLabel}
      </button>
    </div>
  );
}
