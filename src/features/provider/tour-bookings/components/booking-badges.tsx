import type { BookingStatus } from "@/generated/prisma/enums";
import type { PaymentState } from "../types";
import { getBookingStatusMeta, getPaymentMeta } from "../utils";

export function StatusBadge({ status }: { status: BookingStatus }) {
  const meta = getBookingStatusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap shadow-xs ${meta.className}`}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: "15px",
          fontVariationSettings: meta.filled ? "'FILL' 1" : undefined,
        }}
      >
        {meta.icon}
      </span>
      {meta.label}
    </span>
  );
}

export function PaymentBadge({ state }: { state: PaymentState }) {
  const meta = getPaymentMeta(state);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${meta.className}`}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: "14px",
          fontVariationSettings: meta.filled ? "'FILL' 1" : undefined,
        }}
      >
        {meta.icon}
      </span>
      {meta.label}
    </span>
  );
}
