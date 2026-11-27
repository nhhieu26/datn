import {
  StaggerContainer,
  StaggerItem,
} from "@/features/customer/components/motion";
import { formatCurrency } from "@/lib/utils";
import type { MyBookingsSummary, MyRestaurantBookingsSummary } from "../types";

type SummaryCard = { label: string; value: string; icon: string };

export function MyBookingsSummaryCards({ summary }: { summary: MyBookingsSummary }) {
  return (
    <SummaryCardsGrid
      cards={[
        { label: "Tổng thanh toán", value: formatCurrency(summary.totalPaid), icon: "payments" },
        { label: "Chờ thanh toán", value: String(summary.awaitingPayment), icon: "schedule" },
        { label: "Tổng đơn đặt", value: String(summary.total), icon: "confirmation_number" },
      ]}
    />
  );
}

export function MyRestaurantBookingsSummaryCards({
  summary,
}: {
  summary: MyRestaurantBookingsSummary;
}) {
  return (
    <SummaryCardsGrid
      cards={[
        { label: "Sắp tới", value: String(summary.upcoming), icon: "event_upcoming" },
        { label: "Đã hủy", value: String(summary.cancelled), icon: "event_busy" },
        { label: "Tổng đơn đặt", value: String(summary.total), icon: "confirmation_number" },
      ]}
    />
  );
}

function SummaryCardsGrid({ cards }: { cards: SummaryCard[] }) {
  return (
    <StaggerContainer
      className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
      inView={false}
      stagger={0.08}
    >
      {cards.map((card) => (
        <StaggerItem key={card.label} y={12}>
          <div className="rounded bg-white px-2.5 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
            <div className="border-b border-new-chip pb-1.5 text-xs font-semibold text-new-title">
              {card.label}
            </div>
            <div className="flex items-center gap-2 pt-2 text-base font-semibold text-new-teal-cta">
              <span className="material-symbols-outlined text-lg!">{card.icon}</span>
              <span className="truncate">{card.value}</span>
            </div>
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
