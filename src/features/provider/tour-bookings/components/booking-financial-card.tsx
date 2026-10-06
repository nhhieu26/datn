import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { TourBookingDetailView } from "../types";

function Row({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold text-slate-800 ${className}`}>{value}</span>
    </div>
  );
}

export function BookingFinancialCard({
  booking: b,
}: {
  booking: TourBookingDetailView;
}) {
  const ratePct = `${+(b.commissionRate * 100).toFixed(2)}%`;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <Row
          label={`Đơn giá × ${b.guests} khách`}
          value={`${formatCurrency(b.unitPrice)} × ${b.guests}`}
        />
        <Row label="Tổng thanh toán" value={formatCurrency(b.totalAmount)} />
        <Row
          className="text-rose-600"
          label={`Phí dịch vụ (${ratePct})`}
          value={`− ${formatCurrency(b.platformFee)}`}
        />
        {b.refundedAmount > 0 && (
          <Row
            className="text-violet-600"
            label="Đã hoàn tiền"
            value={formatCurrency(b.refundedAmount)}
          />
        )}
        <div className="mt-2 flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold tracking-wider text-brand-600 uppercase">
              Thực nhận
            </span>
            <span className="text-xs text-slate-500">
              {b.payout?.status === "succeeded"
                ? `Đã chi trả ${formatDateTime(b.payout.paidAt)}`
                : "Chi trả sau khi hoàn thành tour"}
            </span>
          </div>
          <span className="text-2xl font-extrabold text-brand-600">
            {formatCurrency(b.providerAmount)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          Giao dịch
        </span>
        {b.payment ? (
          <>
            <Row label="Cổng thanh toán" value={b.payment.gateway.toUpperCase()} />
            <Row
              label="Số tiền thu"
              value={`${b.payment.chargedAmount} ${b.payment.chargedCurrency}`}
            />
            <Row label="Thời gian" value={formatDateTime(b.paidAt)} />
            <Row label="Mã giao dịch" value={b.payment.gatewayOrderId} />
          </>
        ) : (
          <p className="text-sm text-slate-500">Chưa có giao dịch nào.</p>
        )}
      </div>
    </div>
  );
}
