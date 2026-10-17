"use client";

import type { BookingStatus } from "@/generated/prisma/enums";
import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { PaymentState, ProviderBookingTransition } from "../types";
import { PROVIDER_BOOKING_TRANSITIONS, getBookingStatusMeta } from "../utils";
import { BookingIcon, type BookingIconName } from "./booking-icon";
import {
  STATUS_DIALOG_TITLES,
  describeTransition,
  useBookingStatusForm,
  type BookingStatusConfig,
  type StatusTargetBooking,
} from "./booking-status-dialog";

// Bảng màu badge "soft" của Preline cho trang danh sách đơn tour
type BadgeMeta = { icon: BookingIconName; className: string };

const statusBadge: Record<BookingStatus, BadgeMeta> = {
  pending_payment: {
    icon: "clock",
    className: "bg-yellow-100 text-yellow-800",
  },
  pending_confirmation: {
    icon: "hourglass",
    className: "bg-yellow-100 text-yellow-800",
  },
  paid: { icon: "creditCard", className: "bg-blue-100 text-blue-800" },
  confirmed: { icon: "check", className: "bg-teal-100 text-teal-800" },
  completed: { icon: "checkCheck", className: "bg-gray-100 text-gray-800" },
  cancelled: { icon: "circleX", className: "bg-red-100 text-red-800" },
  expired: { icon: "timerOff", className: "bg-gray-100 text-gray-500" },
  no_show: { icon: "userX", className: "bg-red-100 text-red-800" },
};

const paymentBadge: Record<PaymentState, BadgeMeta & { label: string }> = {
  unpaid: {
    label: "Chưa thanh toán",
    icon: "hourglass",
    className: "bg-gray-100 text-gray-800",
  },
  processing: {
    label: "Đang xử lý",
    icon: "loader",
    className: "bg-blue-100 text-blue-800",
  },
  paid: {
    label: "Đã thanh toán",
    icon: "check",
    className: "bg-teal-100 text-teal-800",
  },
  failed: {
    label: "Thất bại",
    icon: "alert",
    className: "bg-red-100 text-red-800",
  },
  refunded: {
    label: "Đã hoàn tiền",
    icon: "undo",
    className: "bg-purple-100 text-purple-800",
  },
};

const badgeClass =
  "inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap";

export const layerButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

export function PrelineStatusBadge({ status }: { status: BookingStatus }) {
  const meta = statusBadge[status];
  return (
    <span className={`${badgeClass} ${meta.className}`}>
      <BookingIcon name={meta.icon} className="size-3" />
      {getBookingStatusMeta(status).label}
    </span>
  );
}

export function PrelinePaymentBadge({ state }: { state: PaymentState }) {
  const meta = paymentBadge[state];
  return (
    <span className={`${badgeClass} ${meta.className}`}>
      <BookingIcon name={meta.icon} className="size-3" />
      {meta.label}
    </span>
  );
}

function StatusModal({
  booking,
  config,
  target,
  onClose,
}: {
  booking: StatusTargetBooking;
  config: BookingStatusConfig;
  target: ProviderBookingTransition;
  onClose: () => void;
}) {
  const {
    isPending,
    isCancel,
    reason,
    changeReason,
    error,
    reasonError,
    notice,
    handleSubmit,
  } = useBookingStatusForm({ booking, config, target, onClose });
  const meta = statusBadge[target];
  const label = getBookingStatusMeta(target).label;

  // Portal ra body nằm ngoài .provider-shell nên phải gắn lại class để
  // dùng token --foreground của Preline thay vì biến cùng tên của site
  return (
    <div
      aria-labelledby="hs-booking-status-modal-label"
      aria-modal="true"
      className="provider-shell fixed inset-0 z-80 flex items-center justify-center overflow-y-auto bg-gray-900/50 p-4 font-inter"
      onClick={() => {
        if (!isPending) onClose();
      }}
      role="dialog"
    >
      <form
        className="flex w-full max-w-lg flex-col rounded-xl border border-overlay-line bg-overlay text-start whitespace-normal shadow-2xs"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between border-b border-overlay-divider px-4 py-3">
          <h3
            className="font-semibold text-foreground"
            id="hs-booking-status-modal-label"
          >
            {STATUS_DIALOG_TITLES[target]} {config.noun}?
          </h3>
          <button
            aria-label="Đóng"
            className="inline-flex size-8 items-center justify-center rounded-full border border-transparent bg-surface text-surface-foreground hover:bg-surface-hover focus:bg-surface-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            <BookingIcon name="x" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex items-center gap-x-3">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-full ${meta.className}`}
            >
              <BookingIcon name={meta.icon} className="size-5" />
            </span>
            <div className="min-w-0">
              <span className="inline-flex rounded-md bg-surface px-1.5 py-0.5 font-mono text-xs font-medium text-surface-foreground">
                {booking.code}
              </span>
              <p className="mt-1 truncate text-sm font-medium text-foreground">
                {config.subtitle}
              </p>
            </div>
          </div>

          {notice ? (
            <div
              className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800"
              role="alert"
            >
              <div className="flex gap-x-3">
                <BookingIcon name="alert" className="mt-0.5 size-4" />
                <p>{notice}</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground-2">
                {describeTransition(target, booking, config)}
              </p>

              {isCancel ? (
                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-foreground"
                    htmlFor="hs-booking-cancel-reason"
                  >
                    Lý do hủy <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    autoFocus
                    className={`block min-h-24 w-full resize-y rounded-lg bg-layer px-3 py-2 text-foreground placeholder:text-muted-foreground-1 disabled:pointer-events-none disabled:opacity-50 sm:text-sm ${
                      reasonError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-layer-line focus:border-primary-focus focus:ring-primary-focus"
                    }`}
                    disabled={isPending}
                    id="hs-booking-cancel-reason"
                    maxLength={500}
                    onChange={(event) => changeReason(event.target.value)}
                    placeholder="Lý do sẽ được gửi cho khách hàng"
                    value={reason}
                  />
                  {reasonError ? (
                    <p className="mt-2 text-sm text-red-600">{reasonError}</p>
                  ) : null}
                </div>
              ) : null}

              {error ? (
                <div
                  className="rounded-lg border border-red-200 bg-red-100 p-4 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-x-2 border-t border-overlay-divider px-4 py-3">
          {notice ? (
            <button
              className="inline-flex items-center justify-center gap-x-2 rounded-lg border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden"
              onClick={onClose}
              type="button"
            >
              Đã hiểu
            </button>
          ) : (
            <>
              <button
                className={`px-3 py-2 ${layerButtonClass}`}
                disabled={isPending}
                onClick={onClose}
                type="button"
              >
                Quay lại
              </button>
              <button
                className={`inline-flex items-center justify-center gap-x-2 rounded-lg border px-3 py-2 text-sm font-medium focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 ${
                  isCancel
                    ? "border-transparent bg-red-600 text-white hover:bg-red-700 focus:bg-red-700"
                    : "border-primary-line bg-primary text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus"
                }`}
                disabled={isPending}
                type="submit"
              >
                {isPending ? (
                  <span
                    aria-label="Đang xử lý"
                    className="inline-block size-4 animate-spin rounded-full border-3 border-current border-t-transparent"
                    role="status"
                  />
                ) : (
                  <BookingIcon name="arrowRight" />
                )}
                {isPending ? "Đang xử lý..." : `Chuyển sang "${label}"`}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

const dropdownItemClass =
  "flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:bg-dropdown-item-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

const dangerItemClass =
  "flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

const transitionItems: Record<
  ProviderBookingTransition,
  { label: string; icon: BookingIconName }
> = {
  confirmed: { label: "Xác nhận đơn", icon: "check" },
  completed: { label: "Hoàn thành đơn", icon: "checkCheck" },
  cancelled: { label: "Hủy đơn", icon: "circleX" },
};

/** Menu thao tác của một đơn: xem chi tiết + các bước đổi trạng thái. */
export function PrelineBookingActions({
  booking,
  config,
  detailHref,
}: {
  booking: StatusTargetBooking;
  config: BookingStatusConfig;
  detailHref: string;
}) {
  const [target, setTarget] = useState<ProviderBookingTransition | null>(null);
  const transitions =
    (config.transitions ?? PROVIDER_BOOKING_TRANSITIONS)[booking.status] ?? [];
  const dropdownId = `hs-booking-actions-${booking.code}`;

  return (
    <>
      <div className="hs-dropdown relative inline-flex [--placement:bottom-right]">
        <button
          aria-expanded="false"
          aria-haspopup="menu"
          aria-label="Thao tác"
          className={`hs-dropdown-toggle size-8 ${layerButtonClass}`}
          id={dropdownId}
          type="button"
        >
          <BookingIcon name="more" />
        </button>

        <div
          aria-labelledby={dropdownId}
          aria-orientation="vertical"
          className="hs-dropdown-menu duration z-20 hidden min-w-52 rounded-xl border border-dropdown-line bg-dropdown opacity-0 shadow-xl transition-[opacity,margin] hs-dropdown-open:opacity-100"
          role="menu"
        >
          <div className="space-y-0.5 p-1">
            <Link className={dropdownItemClass} href={detailHref}>
              <BookingIcon name="eye" />
              Xem chi tiết
            </Link>
          </div>
          {transitions.length > 0 ? (
            <div className="space-y-0.5 border-t border-dropdown-divider p-1">
              {transitions.map((status) => {
                const item = transitionItems[status];
                const blockedHint =
                  status === "completed" ? config.completeBlockedHint : null;
                return (
                  <button
                    className={
                      status === "cancelled"
                        ? dangerItemClass
                        : dropdownItemClass
                    }
                    disabled={blockedHint != null}
                    key={status}
                    onClick={() => setTarget(status)}
                    title={blockedHint ?? undefined}
                    type="button"
                  >
                    <BookingIcon name={item.icon} />
                    <span className="flex flex-col">
                      {item.label}
                      {blockedHint ? (
                        <span className="text-xs text-muted-foreground-1">
                          {blockedHint}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {target
        ? createPortal(
            <StatusModal
              booking={booking}
              config={config}
              onClose={() => setTarget(null)}
              target={target}
            />,
            document.body,
          )
        : null}
    </>
  );
}
