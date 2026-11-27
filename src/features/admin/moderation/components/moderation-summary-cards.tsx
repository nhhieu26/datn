import {
  ApprovalIcon,
  type ApprovalIconName,
} from "@/features/admin/profile-approval/components/approval-icon";
import type { ModerationSummary } from "../types";

export function ModerationSummaryCards({ summary }: { summary: ModerationSummary }) {
  const aiTotal = summary.aiApproved + summary.aiPending + summary.aiRejected + summary.aiFallback;
  const autoRate = aiTotal ? Math.round((summary.aiApproved / aiTotal) * 100) : null;

  const cards: {
    label: string;
    value: string | number;
    detail: string;
    icon: ApprovalIconName;
    iconClass: string;
  }[] = [
    {
      label: "Đang chờ duyệt",
      value: summary.pendingReviews + summary.pendingComments,
      detail: `${summary.pendingReviews} đánh giá · ${summary.pendingComments} bình luận`,
      icon: "clock",
      iconClass: "bg-yellow-100 text-yellow-700",
    },
    {
      label: "Bộ lọc từ khóa chặn",
      value: summary.keywordBlocked,
      detail: "Chặn ngay ở form, 30 ngày qua",
      icon: "ban",
      iconClass: "bg-red-100 text-red-700",
    },
    {
      label: "AI tự động ẩn",
      value: summary.aiRejected,
      detail: `${summary.aiPending} gắn cờ chờ duyệt · ${summary.aiFallback} AI lỗi`,
      icon: "alert",
      iconClass: "bg-orange-100 text-orange-700",
    },
    {
      label: "Tỉ lệ AI tự duyệt",
      value: autoRate == null ? "—" : `${autoRate}%`,
      detail:
        summary.aiAvgLatencyMs == null
          ? "Chưa có lượt kiểm duyệt AI"
          : `${aiTotal} lượt · trung bình ${(summary.aiAvgLatencyMs / 1000).toFixed(1)}s`,
      icon: "shieldCheck",
      iconClass: "bg-teal-100 text-teal-700",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs"
          key={card.label}
        >
          <div className="flex gap-x-4 p-4 md:p-5">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}
            >
              <ApprovalIcon className="size-5" name={card.icon} />
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
