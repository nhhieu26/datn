import { formatCurrency } from "@/lib/utils";
import type { MyBookingsSummary } from "../types";

export function MyBookingsSummaryCards({ summary }: { summary: MyBookingsSummary }) {
  const cards = [
    { label: "Tổng thanh toán", value: formatCurrency(summary.totalPaid), icon: "payments" },
    { label: "Chờ thanh toán", value: String(summary.awaitingPayment), icon: "schedule" },
    { label: "Tổng đơn đặt", value: String(summary.total), icon: "confirmation_number" },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded bg-white px-2.5 py-2.5">
          <div className="border-b border-new-chip pb-1.5 text-xs font-semibold text-new-title">
            {card.label}
          </div>
          <div className="flex items-center gap-2 pt-2 text-base font-semibold text-new-teal-cta">
            <span className="material-symbols-outlined text-lg!">{card.icon}</span>
            <span className="truncate">{card.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
