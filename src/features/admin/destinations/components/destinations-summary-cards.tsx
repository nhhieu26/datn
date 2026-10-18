import type { DestinationsSummary } from "../types";
import { DestinationIcon, type DestinationIconName } from "./destination-icon";

type SummaryCard = {
  label: string;
  value: string | number;
  detail: string;
  icon: DestinationIconName;
  iconClass: string;
};

export function DestinationsSummaryCards({
  summary,
}: {
  summary: DestinationsSummary;
}) {
  const cards: SummaryCard[] = [
    {
      label: "Tổng số địa điểm",
      value: summary.total,
      detail: "Toàn bộ kho địa điểm",
      icon: "compass",
      iconClass: "bg-primary-100 text-primary-700",
    },
    {
      label: "Đã xuất bản",
      value: summary.published,
      detail: "Hiển thị với du khách",
      icon: "check",
      iconClass: "bg-teal-100 text-teal-700",
    },
    {
      label: "Bản nháp",
      value: summary.draft,
      detail: "Chưa hiển thị công khai",
      icon: "draft",
      iconClass: "bg-yellow-100 text-yellow-700",
    },
    {
      label: "Tỷ lệ xuất bản",
      value: `${Math.round((summary.published / Math.max(summary.total, 1)) * 100)}%`,
      detail: "Trên tổng địa điểm hiện có",
      icon: "chart",
      iconClass: "bg-surface text-surface-foreground",
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
              <DestinationIcon name={card.icon} className="size-5" />
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
