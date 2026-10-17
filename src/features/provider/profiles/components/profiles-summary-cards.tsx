import { ProfileIcon, type ProfileIconName } from "./profile-icon";

type SummaryCard = {
  label: string;
  value: number;
  icon: ProfileIconName;
  iconClass: string;
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
      icon: "file",
      iconClass: "bg-primary-100 text-primary-700",
    },
    {
      label: "Đang hoạt động / Đã duyệt",
      value: summary.approved,
      icon: "check",
      iconClass: "bg-teal-100 text-teal-700",
    },
    {
      label: "Đang chờ thẩm định",
      value: summary.pending,
      icon: "clock",
      iconClass: "bg-yellow-100 text-yellow-700",
    },
    {
      label: "Cần bổ sung / Từ chối",
      value: summary.rejected,
      icon: "alert",
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
              <ProfileIcon name={card.icon} className="size-5" />
            </div>
            <div className="grow">
              <p className="text-xs tracking-wide text-muted-foreground-1 uppercase">
                {card.label}
              </p>
              <h3 className="mt-1 text-xl font-medium text-foreground sm:text-2xl">
                {card.value}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
