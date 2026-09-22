import type { ApprovalStatus, BusinessType } from "@/generated/prisma/client";

type Meta = {
  label: string;
  icon: string;
  className: string;
  filled?: boolean;
};

const serviceMeta: Record<BusinessType, Meta> = {
  tour: {
    label: "Tour du lịch",
    icon: "explore",
    className: "border-emerald-200/70 bg-emerald-50 text-emerald-700",
  },
  hotel: {
    label: "Khách sạn & Lưu trú",
    icon: "bed",
    className: "border-blue-200/70 bg-blue-50 text-blue-700",
  },
  restaurant: {
    label: "Nhà hàng & Ẩm thực",
    icon: "restaurant",
    className: "border-orange-200/70 bg-orange-50 text-orange-700",
  },
};

const statusMeta: Record<ApprovalStatus, Meta> = {
  approved: {
    label: "Đã duyệt",
    icon: "check_circle",
    className: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
    filled: true,
  },
  pending: {
    label: "Chờ thẩm định",
    icon: "schedule",
    className: "border-amber-200/80 bg-amber-50 text-amber-700",
  },
  rejected: {
    label: "Từ chối",
    icon: "cancel",
    className: "border-rose-200/80 bg-rose-50 text-rose-700",
  },
  not_submitted: {
    label: "Chưa nộp",
    icon: "draft",
    className: "border-slate-200/80 bg-slate-50 text-slate-600",
  },
};

export function getServiceMeta(type: BusinessType): Meta {
  return serviceMeta[type];
}

export function getStatusMeta(status: ApprovalStatus): Meta {
  return statusMeta[status];
}
