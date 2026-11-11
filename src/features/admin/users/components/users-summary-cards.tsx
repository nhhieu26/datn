import {
  ApprovalIcon,
  type ApprovalIconName,
} from "@/features/admin/profile-approval/components/approval-icon";
import type { AdminUsersSummary } from "../types";

export function UsersSummaryCards({ summary }: { summary: AdminUsersSummary }) {
  const cards: {
    label: string;
    value: number;
    detail: string;
    icon: ApprovalIconName;
    iconClass: string;
  }[] = [
    {
      label: "Tổng người dùng",
      value: summary.total,
      detail: "Tất cả tài khoản trên hệ thống",
      icon: "layers",
      iconClass: "bg-primary-100 text-primary-700",
    },
    {
      label: "Khách hàng",
      value: summary.customers,
      detail: "Tài khoản đặt dịch vụ",
      icon: "user",
      iconClass: "bg-teal-100 text-teal-700",
    },
    {
      label: "Đối tác",
      value: summary.providers,
      detail: "Tài khoản nhà cung cấp",
      icon: "shieldCheck",
      iconClass: "bg-yellow-100 text-yellow-700",
    },
    {
      label: "Đang bị khoá",
      value: summary.banned,
      detail: "Không thể đăng nhập",
      icon: "ban",
      iconClass: "bg-red-100 text-red-700",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs"
        >
          <div className="flex gap-x-4 p-4 md:p-5">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}
            >
              <ApprovalIcon name={card.icon} className="size-5" />
            </div>
            <div className="min-w-0 grow">
              <p className="text-xs tracking-wide text-muted-foreground-1 uppercase">
                {card.label}
              </p>
              <h3 className="mt-1 text-xl font-medium text-foreground sm:text-2xl">
                {card.value}
              </h3>
              <p className="mt-0.5 truncate text-xs text-muted-foreground-1">
                {card.detail}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
