import type { TourBookingDetailView } from "../types";

export function BookingCustomerCard({
  booking: b,
}: {
  booking: TourBookingDetailView;
}) {
  const initial = b.contactName.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-xl font-bold text-brand-600">
          {initial}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-lg font-bold text-slate-900">{b.contactName}</span>
          {b.accountName !== b.contactName && (
            <span className="text-xs text-slate-500">
              Tài khoản: {b.accountName}
            </span>
          )}
        </div>
      </div>
      <a
        className="flex items-center gap-2.5 text-sm text-slate-700 hover:text-brand-600"
        href={`mailto:${b.contactEmail}`}
      >
        <span className="material-symbols-outlined text-[20px] text-brand-600">mail</span>
        <span className="min-w-0 break-all">{b.contactEmail}</span>
      </a>
      <a
        className="flex items-center gap-2.5 text-sm text-slate-700 hover:text-brand-600"
        href={`tel:${b.contactPhone}`}
      >
        <span className="material-symbols-outlined text-[20px] text-brand-600">call</span>
        {b.contactPhone}
      </a>
    </div>
  );
}
