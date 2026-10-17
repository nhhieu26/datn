import {
  BookingIcon,
  type BookingIconName,
} from "@/features/provider/tour-bookings/components/booking-icon";
import {
  buildSteps,
  type TimelineInfo,
  type TimelineStep,
} from "@/features/provider/tour-bookings/components/booking-timeline";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { ReactNode } from "react";
import type { HotelBookingDetailView } from "../types";

// Các khối nội dung phong cách Preline cho trang chi tiết đơn đặt phòng

export function PrelineCard({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: BookingIconName;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-card-line bg-card shadow-2xs">
      <div className="flex items-center justify-between gap-x-3 border-b border-card-divider px-4 py-3 md:px-5">
        <h3 className="inline-flex items-center gap-x-2 font-semibold text-foreground">
          <BookingIcon name={icon} className="size-4 text-muted-foreground-1" />
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

const stepStyle: Record<
  TimelineStep["state"],
  { icon: BookingIconName; className: string }
> = {
  done: { icon: "check", className: "bg-teal-100 text-teal-700" },
  pending: { icon: "clock", className: "bg-surface text-muted-foreground-1" },
  failed: { icon: "circleX", className: "bg-red-100 text-red-700" },
};

/** Timeline dọc theo mẫu Timeline của Preline. */
export function HotelBookingTimeline({
  booking,
}: {
  booking: TimelineInfo;
}) {
  const steps = buildSteps(booking, true);
  return (
    <div className="p-4 md:p-5">
      {steps.map((step) => {
        const style = stepStyle[step.state];
        return (
          <div className="group relative flex gap-x-4" key={step.label}>
            <div className="relative after:absolute after:start-3.5 after:top-8 after:bottom-1 after:w-px after:-translate-x-[0.5px] after:bg-line-2 group-last:after:hidden">
              <span
                className={`relative z-10 flex size-7 items-center justify-center rounded-full ${style.className}`}
              >
                <BookingIcon name={style.icon} className="size-3.5" />
              </span>
            </div>
            <div className="grow pb-6 group-last:pb-0">
              <p
                className={`text-sm font-semibold ${
                  step.state === "pending"
                    ? "text-muted-foreground-1"
                    : "text-foreground"
                }`}
              >
                {step.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground-1">
                {step.hint}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Row({
  label,
  value,
  className = "text-foreground",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-x-6 py-2.5 text-sm">
      <dt className="text-muted-foreground-1">{label}</dt>
      <dd className={`text-end font-medium break-all ${className}`}>{value}</dd>
    </div>
  );
}

export function HotelBookingFinancial({
  booking: b,
}: {
  booking: HotelBookingDetailView;
}) {
  const ratePct = `${+(b.commissionRate * 100).toFixed(2)}%`;
  return (
    <div className="grid md:grid-cols-2">
      <div className="flex flex-col p-4 md:p-5">
        <dl className="divide-y divide-card-divider">
          <Row
            label={`Đơn giá × ${b.roomQuantity} phòng × ${b.nights} đêm`}
            value={`${formatCurrency(b.unitPrice)} × ${b.roomQuantity} × ${b.nights}`}
          />
          <Row label="Tổng thanh toán" value={formatCurrency(b.totalAmount)} />
          <Row
            className="text-red-600"
            label={`Phí dịch vụ (${ratePct})`}
            value={`− ${formatCurrency(b.platformFee)}`}
          />
          {b.refundedAmount > 0 && (
            <Row
              className="text-purple-600"
              label="Đã hoàn tiền"
              value={formatCurrency(b.refundedAmount)}
            />
          )}
        </dl>
        <div className="mt-3 flex items-center justify-between gap-x-4 rounded-lg border border-teal-200 bg-teal-50 p-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-teal-800 uppercase">
              Thực nhận
            </p>
            <p className="text-xs text-teal-700">
              {b.payout?.status === "succeeded"
                ? `Đã chi trả ${formatDateTime(b.payout.paidAt)}`
                : "Chi trả sau khi khách trả phòng"}
            </p>
          </div>
          <span className="text-xl font-semibold text-teal-800 sm:text-2xl">
            {formatCurrency(b.providerAmount)}
          </span>
        </div>
      </div>

      <div className="flex flex-col border-t border-card-divider p-4 md:border-t-0 md:border-s md:p-5">
        <p className="text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
          Giao dịch
        </p>
        {b.payment ? (
          <dl className="mt-1 divide-y divide-card-divider">
            <Row
              label="Cổng thanh toán"
              value={b.payment.gateway.toUpperCase()}
            />
            <Row
              label="Số tiền thu"
              value={`${b.payment.chargedAmount} ${b.payment.chargedCurrency}`}
            />
            <Row label="Thời gian" value={formatDateTime(b.paidAt)} />
            <Row label="Mã giao dịch" value={b.payment.gatewayOrderId} />
          </dl>
        ) : (
          <div className="mt-3 flex grow flex-col items-center justify-center rounded-lg border border-dashed border-card-line p-6 text-center">
            <BookingIcon
              name="creditCard"
              className="size-6 text-muted-foreground-1"
            />
            <p className="mt-2 text-sm text-muted-foreground-1">
              Chưa có giao dịch nào.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const contactLinkClass =
  "flex items-center gap-x-3 rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-surface-hover focus:bg-surface-focus focus:outline-hidden";

export function HotelBookingCustomer({
  booking: b,
}: {
  booking: Pick<
    HotelBookingDetailView,
    "contactName" | "contactEmail" | "contactPhone" | "accountName"
  >;
}) {
  const initial = b.contactName.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="p-4 md:p-5">
      <div className="flex items-center gap-x-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-base font-semibold text-primary-800">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {b.contactName}
          </p>
          {b.accountName !== b.contactName && (
            <p className="truncate text-xs text-muted-foreground-1">
              Tài khoản: {b.accountName}
            </p>
          )}
        </div>
      </div>
      <div className="-mx-2.5 mt-3 space-y-0.5">
        <a className={contactLinkClass} href={`mailto:${b.contactEmail}`}>
          <BookingIcon name="mail" className="size-4 text-muted-foreground-1" />
          <span className="min-w-0 break-all">{b.contactEmail}</span>
        </a>
        <a className={contactLinkClass} href={`tel:${b.contactPhone}`}>
          <BookingIcon name="phone" className="size-4 text-muted-foreground-1" />
          {b.contactPhone}
        </a>
      </div>
    </div>
  );
}

/** Ghi chú của khách / lý do hủy dưới dạng Alert của Preline. */
export function HotelBookingNotes({
  booking: b,
}: {
  booking: Pick<HotelBookingDetailView, "note" | "cancelReason">;
}) {
  const notes = [
    b.note && {
      label: "Ghi chú của khách",
      text: b.note,
      icon: "message" as const,
      className: "border-yellow-200 bg-yellow-50 text-yellow-800",
    },
    b.cancelReason && {
      label: "Lý do hủy",
      text: b.cancelReason,
      icon: "alert" as const,
      className: "border-red-200 bg-red-50 text-red-800",
    },
  ].filter((n) => Boolean(n)) as {
    label: string;
    text: string;
    icon: BookingIconName;
    className: string;
  }[];

  return notes.map((n) => (
    <div
      className={`rounded-xl border p-4 text-sm ${n.className}`}
      key={n.label}
      role="alert"
    >
      <div className="flex gap-x-3">
        <BookingIcon name={n.icon} className="mt-0.5 size-4" />
        <div>
          <h4 className="font-semibold">{n.label}</h4>
          <p className="mt-1 whitespace-pre-line">{n.text}</p>
        </div>
      </div>
    </div>
  ));
}
