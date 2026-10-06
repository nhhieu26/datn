import { formatDateTime } from "@/lib/utils";
import type { TourBookingDetailView } from "../types";

type Step = {
  label: string;
  hint: string;
  state: "done" | "pending" | "failed";
};

function buildSteps(b: TourBookingDetailView): Step[] {
  const steps: Step[] = [
    { label: "Tạo đơn", hint: formatDateTime(b.createdAt), state: "done" },
  ];
  const terminal =
    b.status === "cancelled" ||
    b.status === "expired" ||
    b.status === "no_show";

  if (b.paidAt) {
    steps.push({ label: "Đã thanh toán", hint: formatDateTime(b.paidAt), state: "done" });
  } else if (!terminal || b.status === "expired") {
    steps.push({
      label: "Thanh toán",
      hint:
        b.status === "pending_payment" && b.expiresAt
          ? `Giữ chỗ đến ${formatDateTime(b.expiresAt)}`
          : "Chưa thanh toán",
      state: b.status === "expired" ? "failed" : "pending",
    });
  }

  if (b.status === "expired") return steps;

  if (terminal) {
    steps.push({
      label: b.status === "no_show" ? "Khách vắng mặt" : "Đã hủy",
      hint: formatDateTime(b.cancelledAt),
      state: "failed",
    });
    return steps;
  }

  steps.push({
    label: "Đã xác nhận",
    hint: b.confirmedAt ? formatDateTime(b.confirmedAt) : "Chờ xác nhận",
    state: b.confirmedAt ? "done" : "pending",
  });
  steps.push({
    label: "Hoàn thành",
    hint: b.completedAt ? formatDateTime(b.completedAt) : "Sắp tới",
    state: b.completedAt ? "done" : "pending",
  });
  return steps;
}

const dot = {
  done: { icon: "check_circle", cls: "text-brand-600" },
  pending: { icon: "radio_button_unchecked", cls: "text-slate-300" },
  failed: { icon: "cancel", cls: "text-rose-500" },
} as const;

export function BookingTimeline({ booking }: { booking: TourBookingDetailView }) {
  const steps = buildSteps(booking);
  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:gap-0">
      {steps.map((step) => (
        <li className="flex flex-1 items-start gap-2.5" key={step.label}>
          <span
            className={`material-symbols-outlined ${dot[step.state].cls}`}
            style={{ fontVariationSettings: step.state === "pending" ? undefined : "'FILL' 1" }}
          >
            {dot[step.state].icon}
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wide text-slate-800 uppercase">
              {step.label}
            </span>
            <span className="text-xs text-slate-500">{step.hint}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
