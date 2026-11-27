import type { Role, UserStatus } from "@/entities/user";

export const userStatusMeta: Record<
  UserStatus,
  { label: string; className: string }
> = {
  active: { label: "Đang hoạt động", className: "bg-teal-100 text-teal-800" },
  inactive: {
    label: "Chưa kích hoạt",
    className: "bg-surface text-surface-foreground",
  },
  banned: { label: "Đã bị khoá", className: "bg-red-100 text-red-800" },
};

export const roleMeta: Record<Role, { label: string; className: string }> = {
  customer: {
    label: "Khách hàng",
    className: "border-line-2 text-foreground",
  },
  provider: {
    label: "Đối tác",
    className: "border-primary-200 bg-primary-50 text-primary-700",
  },
  admin: {
    label: "Quản trị viên",
    className: "border-yellow-200 bg-yellow-50 text-yellow-800",
  },
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const meta = userStatusMeta[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  const meta = roleMeta[role];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

export function UserAvatar({
  name,
  className = "size-9.5 text-sm",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-surface font-semibold text-surface-foreground ${className}`}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

// Admin chỉ khoá/mở khoá được tài khoản không phải admin và không phải chính mình.
export function canToggleStatus(
  user: { id: string; role: Role },
  currentAdminId: string,
) {
  return user.role !== "admin" && user.id !== currentAdminId;
}
