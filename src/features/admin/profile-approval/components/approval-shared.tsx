import type { BusinessType } from "@/generated/prisma/client";
import type { ActionState } from "@/shared/lib/action-state";
import type {
  ApprovalMutationResult,
  ApprovalProfile,
  ReviewApprovalStatus,
} from "../types";
import { ApprovalIcon, type ApprovalIconName } from "./approval-icon";

export type StatusFilter = ReviewApprovalStatus | "all";
export type TypeFilter = BusinessType | "all";

export type ApprovalCounts = {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
};

export const businessMeta: Record<
  BusinessType,
  { label: string; shortLabel: string; icon: ApprovalIconName }
> = {
  tour: { label: "Tour du lịch", shortLabel: "Tour", icon: "map" },
  hotel: { label: "Khách sạn & Lưu trú", shortLabel: "Lưu trú", icon: "bed" },
  restaurant: {
    label: "Nhà hàng & Ẩm thực",
    shortLabel: "Ẩm thực",
    icon: "utensils",
  },
};

export const statusMeta: Record<
  ReviewApprovalStatus,
  { label: string; icon: ApprovalIconName; className: string }
> = {
  pending: {
    label: "Chờ duyệt",
    icon: "clock",
    className: "bg-yellow-100 text-yellow-800",
  },
  approved: {
    label: "Đã duyệt",
    icon: "check",
    className: "bg-teal-100 text-teal-800",
  },
  rejected: {
    label: "Từ chối",
    icon: "x",
    className: "bg-red-100 text-red-800",
  },
};

// Class dùng chung theo token Preline
export const inputClass =
  "block rounded-lg border-layer-line bg-layer py-2 text-foreground placeholder:text-muted-foreground-1 focus:border-primary-focus focus:ring-primary-focus disabled:pointer-events-none disabled:opacity-50 sm:text-sm";

export const checkboxClass =
  "size-4 shrink-0 rounded-sm border-line-3 bg-transparent text-primary shadow-2xs checked:border-primary-checked checked:bg-primary-checked focus:ring-0 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50";

export const layerButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

export function BusinessBadge({ type }: { type: BusinessType }) {
  const meta = businessMeta[type];
  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-md border border-line-2 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-foreground">
      <ApprovalIcon
        name={meta.icon}
        className="size-3 text-muted-foreground-1"
      />
      {meta.shortLabel}
    </span>
  );
}

export function StatusBadge({ status }: { status: ReviewApprovalStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${meta.className}`}
    >
      <ApprovalIcon name={meta.icon} className="size-3" />
      {meta.label}
    </span>
  );
}

export function ProfileAvatar({ profile }: { profile: ApprovalProfile }) {
  if (profile.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={profile.businessName}
        className="size-9.5 shrink-0 rounded-lg object-cover"
        src={profile.photoUrl}
      />
    );
  }

  return (
    <span className="inline-flex size-9.5 shrink-0 items-center justify-center rounded-lg bg-surface text-sm font-semibold text-surface-foreground">
      {profile.businessName.charAt(0).toUpperCase()}
    </span>
  );
}

export function getActionError(state: ActionState<ApprovalMutationResult>) {
  if (state.formError) return state.formError;
  const firstFieldError = Object.values(state.fieldErrors ?? {})[0]?.[0];
  return firstFieldError ?? "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

export function ApprovalToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed end-5 top-20 z-80 max-w-sm rounded-xl border border-dropdown-line bg-dropdown shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-x-3 p-4">
        <ApprovalIcon name="info" className="mt-0.5 size-4 text-primary-600" />
        <p className="text-sm text-foreground">{message}</p>
        <button
          aria-label="Đóng thông báo"
          className="ms-auto inline-flex size-5 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground focus:text-foreground focus:outline-hidden"
          onClick={onClose}
          type="button"
        >
          <ApprovalIcon name="close" className="size-4" />
        </button>
      </div>
    </div>
  );
}
