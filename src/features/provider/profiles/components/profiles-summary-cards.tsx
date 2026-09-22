type SummaryCard = {
  label: string;
  value: number;
  icon: string;
  iconClass: string;
  valueClass: string;
  filled?: boolean;
};

export type ProfilesSummary = {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
};

export function ProfilesSummaryCards({
  summary,
}: {
  summary: ProfilesSummary;
}) {
  const cards: SummaryCard[] = [
    {
      label: "Tổng hồ sơ",
      value: summary.total,
      icon: "description",
      iconClass: "bg-slate-100 text-slate-700",
      valueClass: "text-slate-900",
    },
    {
      label: "Đang hoạt động / Đã duyệt",
      value: summary.approved,
      icon: "check_circle",
      iconClass: "bg-emerald-50 text-emerald-600",
      valueClass: "text-emerald-600",
      filled: true,
    },
    {
      label: "Đang chờ thẩm định",
      value: summary.pending,
      icon: "schedule",
      iconClass: "bg-amber-50 text-amber-600",
      valueClass: "text-amber-600",
    },
    {
      label: "Cần bổ sung / Từ chối",
      value: summary.rejected,
      icon: "error",
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
          <div>
            <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {card.label}
            </div>
            <div className={`mt-0.5 text-2xl font-extrabold ${card.valueClass}`}>
              {card.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
