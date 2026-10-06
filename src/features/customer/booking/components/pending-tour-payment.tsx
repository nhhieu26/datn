"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { startTourPaymentAction } from "../actions";
import type { BookingSummary } from "../types";
import { BookingSummaryCard } from "./booking-summary-card";
import { HoldCountdown, useHoldRemaining } from "./hold-countdown";
import { PaymentStep } from "./payment-step";

const PRIMARY_BTN =
  "block w-full cursor-pointer rounded bg-new-teal px-7 py-3.5 text-center font-bold text-white transition-colors hover:bg-new-teal-hover disabled:cursor-not-allowed disabled:opacity-50";

/** Booking tour đang giữ chỗ: đếm ngược + thanh toán (lại) với PayPal. */
export function PendingTourPayment({
  code,
  expiresAt,
  failureReason,
  summary,
  usdRate,
}: {
  code: string;
  expiresAt: string;
  failureReason?: string;
  summary: BookingSummary;
  usdRate: number;
}) {
  const remaining = useHoldRemaining(expiresAt);
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState<string>();
  const [error, setError] = useState(failureReason);
  const [pending, startTransition] = useTransition();

  function pay() {
    if (!agreed) {
      setAgreeError("Vui lòng đồng ý điều khoản để tiếp tục");
      return;
    }
    setError(undefined);
    startTransition(async () => {
      const result = await startTourPaymentAction(code);
      if (result.status === "success" && result.data) {
        window.location.assign(result.data.approveUrl);
        return;
      }
      setError(result.formError ?? "Không thể khởi tạo thanh toán.");
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div>
        <h3 className="mb-6 text-2xl font-bold text-new-title">
          Thanh toán đơn {code}
        </h3>
        <PaymentStep
          agreed={agreed}
          error={agreeError}
          notice={<HoldCountdown remaining={remaining} />}
          onAgreeChange={(v) => {
            setAgreed(v);
            setAgreeError(undefined);
          }}
          totalAmount={summary.totalAmount ?? 0}
          usdRate={usdRate}
        />
      </div>
      <BookingSummaryCard summary={summary}>
        {error && (
          <p className="mb-3 rounded bg-new-coral/10 p-3 text-sm text-new-coral" role="alert">
            {error}
          </p>
        )}
        {remaining === 0 ? (
          <Link className={PRIMARY_BTN} href={summary.backHref}>
            Đặt lại tour
          </Link>
        ) : (
          <button
            className={PRIMARY_BTN}
            disabled={pending}
            onClick={pay}
            type="button"
          >
            {pending ? "Đang chuyển sang PayPal..." : "Thanh toán với PayPal"}
          </button>
        )}
      </BookingSummaryCard>
    </div>
  );
}
