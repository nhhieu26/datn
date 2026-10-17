import { HotelsSummary } from "../types";
import { HotelIcon, type HotelIconName } from "./hotel-icon";

type SummaryCard = {
  label: string;
  value: number;
  hint: string;
  icon: HotelIconName;
  iconClass: string;
};

export function HotelsSummaryCards({ summary }: { summary: HotelsSummary }) {
  const cards: SummaryCard[] = [
    {
      label: "Tổng số khách sạn",
      value: summary.total,
      hint: "Toàn bộ kho lưu trú",
      icon: "building",
      iconClass: "bg-primary-100 text-primary-700",
    },
    {
      label: "Đang mở bán",
      value: summary.published,
      hint: "Đang nhận đặt phòng",
      icon: "check",
      iconClass: "bg-teal-100 text-teal-700",
    },
    {
      label: "Tạm dừng",
      value: summary.inactive,
      hint: "Cần kiểm tra lại",
      icon: "pause",
      iconClass: "bg-red-100 text-red-700",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs"
        >
          <div className="flex gap-x-4 p-4 md:p-5">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}
            >
              <HotelIcon name={card.icon} className="size-5" />
            </div>
            <div className="grow">
              <p className="text-xs tracking-wide text-muted-foreground-1 uppercase">
                {card.label}
              </p>
              <h3 className="mt-1 text-xl font-medium text-foreground sm:text-2xl">
                {card.value}
              </h3>
              <p className="text-xs text-muted-foreground-1">{card.hint}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
