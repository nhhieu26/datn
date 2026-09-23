import type { ToursSummary } from "../mock-data";

type SummaryCard = {
  label: string;
  value: number;
  hint: string;
  icon: string;
  iconClass: string;
  valueClass: string;
  filled?: boolean;
};

export function ToursSummaryCards({ summary }: { summary: ToursSummary }) {
  const cards: SummaryCard[] = [
    {
      label: "Tổng số tour",
      value: summary.total,
      hint: "Toàn bộ kho dịch vụ",
      icon: "explore",
      iconClass: "bg-slate-100 text-slate-700",
      valueClass: "text-slate-900",
    },
    {
      label: "Đang mở bán",
      value: summary.published,
      hint: "Đang nhận đặt chỗ",
      icon: "check_circle",
      iconClass: "bg-emerald-50 text-emerald-600",
      valueClass: "text-emerald-600",
      filled: true,
    },
    {
      label: "Chờ duyệt",
      value: summary.pending,
      hint: "Đang chờ thẩm định",
      icon: "schedule",
      iconClass: "bg-amber-50 text-amber-600",
      valueClass: "text-amber-600",
    },
    {
      label: "Tạm dừng / Từ chối",
      value: summary.inactive,
      hint: "Cần bảo trì lịch",
      icon: "pause_circle",
      iconClass: "bg-rose-50 text-rose-600",
      valueClass: "text-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={
                card.filled ? { fontVariationSettings: "'FILL' 1" } : undefined
              }
            >
              {card.icon}
            </span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {card.label}
            </div>
            <div
              className={`mt-0.5 text-2xl font-extrabold ${card.valueClass}`}
            >
              {card.value}
            </div>
            <div className="truncate text-[11px] font-medium text-slate-400">
              {card.hint}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
