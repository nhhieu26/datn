import type { ApprovalStatus, BusinessType } from "@/generated/prisma/client";
import Image from "next/image";
import type { ApprovalProfile } from "../types";

export type StatusFilter = ApprovalStatus | "all";
export type TypeFilter = BusinessType | "all";

export type ApprovalCounts = {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
};

export const businessMeta: Record<
  BusinessType,
  { label: string; shortLabel: string; icon: string; className: string }
> = {
  tour: {
    label: "Tour du lịch",
    shortLabel: "Tour",
    icon: "explore",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  hotel: {
    label: "Khách sạn & Lưu trú",
    shortLabel: "Lưu trú",
    icon: "bed",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  restaurant: {
    label: "Nhà hàng & Ẩm thực",
    shortLabel: "Ẩm thực",
    icon: "restaurant",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
};

export const statusMeta: Record<
  ApprovalStatus,
  { label: string; icon: string; className: string; dot: string }
> = {
  pending: {
    label: "Chờ duyệt",
    icon: "schedule",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Đã duyệt",
    icon: "check_circle",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Từ chối",
    icon: "cancel",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  not_submitted: {
    label: "Chưa nộp",
    icon: "draft",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
  },
};

export function BusinessBadge({ type }: { type: BusinessType }) {
  const meta = businessMeta[type];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1 py-px text-[11px] leading-none font-bold ${meta.className}`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
        {meta.icon}
      </span>
      {meta.shortLabel}
    </span>
  );
}

export function StatusBadge({ status }: { status: ApprovalStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${meta.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function ProfileAvatar({ profile }: { profile: ApprovalProfile }) {
  if (profile.photoUrl) {
    return (
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
        <Image
          src={profile.photoUrl}
          alt={profile.businessName}
          fill
          sizes="44px"
          className="object-cover"
        />
      </div>
    );
  }

  const colors: Record<BusinessType, string> = {
    tour: "from-emerald-400 to-teal-600",
    hotel: "from-sky-400 to-indigo-600",
    restaurant: "from-orange-400 to-rose-500",
  };

  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-extrabold text-white shadow-sm ${colors[profile.businessType]}`}
    >
      {profile.businessName.charAt(0)}
    </div>
  );
}
