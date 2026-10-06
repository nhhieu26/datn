"use client";

import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { BookingStatus } from "@/generated/prisma/enums";
import type { updateTourBookingStatusAction } from "../actions";
import type { ProviderBookingTransition } from "../types";
import { getBookingStatusMeta } from "../utils";

export type StatusTargetBooking = {
  code: string;
  status: BookingStatus;
  /** Chỉ dùng trong mô tả mặc định của đơn có thanh toán (tour / khách sạn) */
  totalAmount?: number;
  providerAmount?: number;
};

/** Phần khác nhau giữa đơn tour / đơn khách sạn khi đổi trạng thái. */
export type BookingStatusConfig = {
  /** "đặt tour" | "đặt phòng" */
  noun: string;
  subtitle: string;
  /** Hệ quả trả lại chỗ/phòng khi hủy, vd "trả lại 2 chỗ cho lịch khởi hành" */
  cancelEffect: string;
  /** null = được hoàn thành; ngược lại là lý do chưa được hoàn thành */
  completeBlockedHint?: string | null;
  /** Mặc định PROVIDER_BOOKING_TRANSITIONS (đơn có thanh toán) */
  transitions?: Partial<Record<BookingStatus, ProviderBookingTransition[]>>;
  /** Ghi đè mô tả hệ quả của từng trạng thái đích */
  descriptions?: Partial<Record<ProviderBookingTransition, string>>;
  onSubmit: typeof updateTourBookingStatusAction;
};

const TITLES: Record<ProviderBookingTransition, string> = {
  confirmed: "Xác nhận đơn",
  completed: "Hoàn thành đơn",
  cancelled: "Hủy đơn",
};

// PayPal từ chối giao dịch ngay khi gọi API; đơn vẫn đã chuyển trạng thái.
const FAILED_NOTICE: Partial<Record<ProviderBookingTransition, string>> = {
  cancelled:
    "Đơn đã được hủy nhưng PayPal từ chối hoàn tiền. Sàn sẽ xử lý thủ công khoản hoàn tiền này.",
  completed:
    "Đơn đã hoàn thành nhưng PayPal từ chối chuyển tiền. Sàn sẽ liên hệ để xử lý khoản thanh toán này.",
};

function describe(
  target: ProviderBookingTransition,
  booking: StatusTargetBooking,
  config: BookingStatusConfig,
) {
  const override = config.descriptions?.[target];
  if (override) return override;
  switch (target) {
    case "confirmed":
      return "Khách hàng sẽ thấy đơn đã được xác nhận. Sau khi xác nhận, đơn không thể hủy từ trang này.";
    case "completed":
      return `Sàn sẽ chuyển ${formatCurrency(booking.providerAmount ?? 0)} (thực nhận) vào tài khoản PayPal đã liên kết của bạn. Thao tác không thể hoàn tác.`;
    case "cancelled":
      return `Sàn sẽ hoàn ${formatCurrency(booking.totalAmount ?? 0)} cho khách qua PayPal và ${config.cancelEffect}. Thao tác không thể hoàn tác.`;
  }
}

export function BookingStatusDialog({
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [notice, setNotice] = useState("");
  const meta = getBookingStatusMeta(target);
  const isCancel = target === "cancelled";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isPending, onClose]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isCancel && reason.trim().length < 5) {
      setReasonError("Lý do hủy cần ít nhất 5 ký tự.");
      return;
    }
    setError("");
    setReasonError("");
    startTransition(async () => {
      const result = await config.onSubmit({
        code: booking.code,
        status: target,
        ...(isCancel && { reason }),
      });
      if (result.status !== "success") {
        setReasonError(result.fieldErrors?.reason?.[0] ?? "");
        setError(
          result.formError ??
            (result.fieldErrors ? "" : "Không thể cập nhật trạng thái."),
        );
        return;
      }
      router.refresh();
      const failedNotice =
        result.data?.moneyStatus === "failed" ? FAILED_NOTICE[target] : null;
      if (failedNotice) setNotice(failedNotice);
      else onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
      onClick={() => {
        if (!isPending) onClose();
      }}
      role="presentation"
    >
      <form
        aria-labelledby="booking-status-heading"
        aria-modal="true"
        className="relative w-full max-w-[460px] rounded-2xl border border-slate-200 bg-white p-6 text-left whitespace-normal shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        role="dialog"
      >
        <div
          className={`mb-4 flex size-10 items-center justify-center rounded-full border ${meta.className}`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{
              fontVariationSettings: meta.filled ? "'FILL' 1" : undefined,
            }}
          >
            {meta.icon}
          </span>
        </div>
        <h2
          className="text-lg font-bold text-slate-900"
          id="booking-status-heading"
        >
          {TITLES[target]} {config.noun}?
        </h2>
        <p className="mt-1 text-xs font-semibold text-brand-600">
          {booking.code} · {config.subtitle}
        </p>

        {notice ? (
          <>
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
              {notice}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                onClick={onClose}
                type="button"
              >
                Đã hiểu
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {describe(target, booking, config)}
            </p>

            {isCancel ? (
              <label className="mt-4 block">
                <span className="text-xs font-semibold text-slate-700">
                  Lý do hủy <span className="text-rose-500">*</span>
                </span>
                <textarea
                  className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  disabled={isPending}
                  maxLength={500}
                  onChange={(event) => {
                    setReason(event.target.value);
                    setReasonError("");
                  }}
                  placeholder="Lý do sẽ được gửi cho khách hàng"
                  rows={3}
                  value={reason}
                />
                {reasonError ? (
                  <span className="mt-1 block text-xs text-rose-600">
                    {reasonError}
                  </span>
                ) : null}
              </label>
            ) : null}

            {error ? (
              <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                disabled={isPending}
                onClick={onClose}
                type="button"
              >
                Quay lại
              </button>
              <button
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${
                  isCancel
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-brand-500 hover:bg-brand-600"
                }`}
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Đang xử lý..." : `Chuyển sang "${meta.label}"`}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
