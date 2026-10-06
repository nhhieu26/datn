"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { getBookingStatusMeta } from "@/features/provider/tour-bookings";
import { formatCurrency } from "@/lib/utils";
import {
  cancelMyHotelBookingAction,
  cancelMyTourBookingAction,
} from "../actions";
import type { BookingKind, CancellableBooking } from "../types";

const COPY: Record<
  BookingKind,
  { action: typeof cancelMyTourBookingAction; heading: string; provider: string }
> = {
  tour: {
    action: cancelMyTourBookingAction,
    heading: "Hủy đơn đặt tour?",
    provider: "nhà cung cấp tour",
  },
  hotel: {
    action: cancelMyHotelBookingAction,
    heading: "Hủy đơn đặt phòng?",
    provider: "khách sạn",
  },
};

export function CancelMyBookingDialog({
  item,
  onClose,
}: {
  item: CancellableBooking;
  onClose: () => void;
}) {
  const copy = COPY[item.kind];
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [notice, setNotice] = useState("");
  const meta = getBookingStatusMeta("cancelled");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isPending, onClose]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (reason.trim().length < 5) {
      setReasonError("Lý do hủy cần ít nhất 5 ký tự.");
      return;
    }
    setError("");
    setReasonError("");
    startTransition(async () => {
      const result = await copy.action({
        code: item.code,
        reason,
      });
      if (result.status !== "success") {
        setReasonError(result.fieldErrors?.reason?.[0] ?? "");
        setError(
          result.formError ?? (result.fieldErrors ? "" : "Không thể hủy đơn."),
        );
        return;
      }
      router.refresh();
      // PayPal từ chối giao dịch ngay khi gọi API; đơn vẫn đã bị hủy.
      if (result.data?.moneyStatus === "failed") {
        setNotice(
          "Đơn đã được hủy nhưng PayPal từ chối hoàn tiền. Sàn sẽ xử lý thủ công khoản hoàn tiền này.",
        );
      } else {
        onClose();
      }
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
        aria-labelledby="cancel-booking-heading"
        aria-modal="true"
        className="relative w-full max-w-[460px] rounded-md border border-new-input-border bg-white p-6 text-left whitespace-normal shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        role="dialog"
      >
        <div
          className={`mb-4 flex size-10 items-center justify-center rounded-full border ${meta.className}`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {meta.icon}
          </span>
        </div>
        <h2
          className="text-lg font-semibold text-new-title"
          id="cancel-booking-heading"
        >
          {copy.heading}
        </h2>
        <p className="mt-1 text-xs font-semibold text-new-teal-cta">
          {item.code} · {item.title}
        </p>

        {notice ? (
          <>
            <p className="mt-4 rounded border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
              {notice}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                className="rounded bg-new-teal-cta px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-new-teal-hover"
                onClick={onClose}
                type="button"
              >
                Đã hiểu
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-relaxed text-new-paragraph">
              Sàn sẽ hoàn {formatCurrency(item.totalAmount)} về tài khoản PayPal
              bạn đã dùng để thanh toán. Thao tác không thể hoàn tác.
            </p>

            <label className="mt-4 block">
              <span className="text-xs font-semibold text-new-title">
                Lý do hủy <span className="text-rose-500">*</span>
              </span>
              <textarea
                className="mt-1.5 w-full resize-none rounded border border-new-input-border px-3.5 py-2.5 text-sm text-new-title placeholder:text-new-placeholder focus:border-new-teal-cta focus:outline-none"
                disabled={isPending}
                maxLength={500}
                onChange={(event) => {
                  setReason(event.target.value);
                  setReasonError("");
                }}
                placeholder={`Lý do sẽ được gửi cho ${copy.provider}`}
                rows={3}
                value={reason}
              />
              {reasonError ? (
                <span className="mt-1 block text-xs text-rose-600">
                  {reasonError}
                </span>
              ) : null}
            </label>

            {error ? (
              <p className="mt-4 rounded border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                className="rounded border border-new-input-border px-4 py-2.5 text-sm font-semibold text-new-paragraph transition hover:bg-new-section-bg disabled:opacity-50"
                disabled={isPending}
                onClick={onClose}
                type="button"
              >
                Quay lại
              </button>
              <button
                className="rounded bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Đang xử lý..." : "Hủy đơn"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
