import type { ReactNode } from "react";
import Link from "next/link";

type ResultSectionProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  actionLabel: string;
  actionHref: string;
  children: ReactNode;
};

export function ResultSection({
  icon,
  title,
  subtitle,
  actionLabel,
  actionHref,
  children,
}: ResultSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center text-slate-900 flex-shrink-0">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          </div>
        </div>
        <Link
          className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition group"
          href={actionHref}
        >
          <span>{actionLabel}</span>
          <span className="transform group-hover:translate-x-0.5 transition">
            →
          </span>
        </Link>
      </div>
      {children}
    </div>
  );
}
