import type { RestaurantBookingsSummary } from "../types";

type SummaryCard = {
  label: string;
  value: string;
  icon: string;
  iconClass: string;
  valueClass: string;
  filled?: boolean;
};

export function RestaurantBookingsSummaryCards({
  summary,
}: {
  summary: RestaurantBookingsSummary;
}) {
  const cards: SummaryCard[] = [
    {
      label: "Tổng đơn đặt",
      value: String(summary.total),
      icon: "confirmation_number",
      iconClass: "bg-slate-100 text-slate-700",
      valueClass: "text-slate-900",
    },
    {
      label: "Chờ xác nhận",
      value: String(summary.pendingConfirmation),
      icon: "hourglass_top",
      iconClass: "bg-amber-50 text-amber-600",
      valueClass: "text-amber-600",
    },
    {
      label: "Đã xác nhận",
      value: String(summary.confirmed),
      icon: "check_circle",
      iconClass: "bg-emerald-50 text-emerald-600",
      valueClass: "text-emerald-600",
      filled: true,
    },
    {
      label: "Sắp tới",
      value: String(summary.upcoming),
      icon: "event_upcoming",
      iconClass: "bg-brand-50 text-brand-600",
      valueClass: "text-brand-600",
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
            <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {card.label}
            </div>
            <div
              className={`mt-0.5 truncate text-2xl font-extrabold ${card.valueClass}`}
            >
              {card.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
