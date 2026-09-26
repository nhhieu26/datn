import type { ApprovalCounts } from "./approval-shared";

function SummaryCard({
  label,
  value,
  detail,
  icon,
  iconClass,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: string;
  iconClass: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 truncate text-[11px] text-slate-400">{detail}</p>
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </span>
      </div>
    </div>
  );
}

export function ApprovalSummaryCards({ counts }: { counts: ApprovalCounts }) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <SummaryCard
        label="Hồ sơ chờ duyệt"
        value={counts.pending}
        detail="Cần xử lý trong vòng 24 giờ"
        icon="pending_actions"
        iconClass="bg-amber-50 text-amber-600"
      />
      <SummaryCard
        label="Đã duyệt"
        value={counts.approved}
        detail="Tổng hồ sơ trong danh sách"
        icon="verified"
        iconClass="bg-emerald-50 text-emerald-600"
      />
      <SummaryCard
        label="Hồ sơ từ chối"
        value={counts.rejected}
        detail="Đã gửi lý do cho đối tác"
        icon="assignment_late"
        iconClass="bg-rose-50 text-rose-600"
      />
      <SummaryCard
        label="Tỷ lệ phê duyệt"
        value={`${Math.round((counts.approved / Math.max(counts.all, 1)) * 100)}%`}
        detail="Trên tổng hồ sơ hiện có"
        icon="query_stats"
        iconClass="bg-sky-50 text-sky-600"
      />
    </section>
  );
}
