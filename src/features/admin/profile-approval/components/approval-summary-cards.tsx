import { ApprovalIcon, type ApprovalIconName } from "./approval-icon";
import type { ApprovalCounts } from "./approval-shared";

type SummaryCard = {
  label: string;
  value: string | number;
  detail: string;
  icon: ApprovalIconName;
  iconClass: string;
};

export function ApprovalSummaryCards({ counts }: { counts: ApprovalCounts }) {
  const cards: SummaryCard[] = [
    {
      label: "Hồ sơ chờ duyệt",
      value: counts.pending,
      detail: "Cần xử lý trong vòng 24 giờ",
      icon: "clock",
      iconClass: "bg-yellow-100 text-yellow-700",
    },
    {
      label: "Đã duyệt",
      value: counts.approved,
      detail: "Tổng hồ sơ trong danh sách",
      icon: "check",
      iconClass: "bg-teal-100 text-teal-700",
    },
    {
      label: "Hồ sơ từ chối",
      value: counts.rejected,
      detail: "Đã gửi lý do cho đối tác",
      icon: "alert",
      iconClass: "bg-red-100 text-red-700",
    },
    {
      label: "Tỷ lệ phê duyệt",
      value: `${Math.round((counts.approved / Math.max(counts.all, 1)) * 100)}%`,
      detail: "Trên tổng hồ sơ hiện có",
      icon: "chart",
      iconClass: "bg-primary-100 text-primary-700",
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
