import type { ApprovalStatus, BusinessType } from "@/generated/prisma/client";
import { getServiceMeta, getStatusMeta } from "../../utils";
import { ProfileIcon, type ProfileIconName } from "./profile-icon";

const serviceIcons: Record<BusinessType, ProfileIconName> = {
  tour: "map",
  hotel: "bed",
  restaurant: "utensils",
};

const statusStyles: Record<
  ApprovalStatus,
  { icon: ProfileIconName; className: string }
> = {
  approved: { icon: "check", className: "bg-teal-100 text-teal-800" },
  pending: { icon: "clock", className: "bg-yellow-100 text-yellow-800" },
  rejected: { icon: "x", className: "bg-red-100 text-red-800" },
  not_submitted: {
    icon: "draft",
    className: "bg-surface text-surface-foreground",
  },
};

export function ServiceBadge({ type }: { type: BusinessType }) {
  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-md border border-line-2 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-foreground">
      <ProfileIcon
        name={serviceIcons[type]}
        className="size-3 text-muted-foreground-1"
      />
      {getServiceMeta(type).label}
    </span>
  );
}

export function StatusBadge({ status }: { status: ApprovalStatus }) {
  const style = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${style.className}`}
    >
      <ProfileIcon name={style.icon} className="size-3" />
      {getStatusMeta(status).label}
    </span>
  );
}
