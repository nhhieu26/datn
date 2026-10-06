"use client";

import { PageBanner } from "@/features/customer/components/page-banner";
import { formatEntityCode } from "@/lib/utils";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  createTourBookingAction,
  startTourPaymentAction,
} from "../actions";
import { CODE_PREFIX, KIND_LABEL, stepLabels } from "../lib/booking-labels";
import type { BookingSummary, ContactValues } from "../types";
import { BookingStepper } from "./booking-stepper";
import { BookingSummaryCard } from "./booking-summary-card";
import { CompleteStep } from "./complete-step";
import {
  ContactForm,
  validateContact,
  type ContactErrors,
} from "./contact-form";
import { HoldCountdown, useHoldRemaining } from "./hold-countdown";
import { PaymentStep } from "./payment-step";

const PRIMARY_BTN =
  "w-full cursor-pointer rounded bg-new-teal px-7 py-3.5 font-bold text-white transition-colors hover:bg-new-teal-hover disabled:cursor-not-allowed disabled:opacity-50";

type Hold = { code: string; expiresAt: string };

export function BookingFlow({
  summary,
  initialContact,
  usdRate,
}: {
  summary: BookingSummary;
  initialContact: ContactValues;
  usdRate: number;
}) {
  const needsPayment = summary.totalAmount != null;
  const steps = stepLabels(summary.kind);
  const lastStep = steps.length - 1;

  const [step, setStep] = useState(0);
  const [contact, setContact] = useState(initialContact);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [code, setCode] = useState("");
  // Booking tour đang giữ chỗ (đã tạo ở server)
  const [hold, setHold] = useState<Hold | null>(null);
  const [pending, startTransition] = useTransition();
  const remaining = useHoldRemaining(hold?.expiresAt ?? new Date(0).toISOString());
  const holdExpired = hold != null && remaining === 0;

  function finish() {
    // ponytail: UI-only cho khách sạn / nhà hàng — mã giả sinh ở client
    setCode(formatEntityCode(CODE_PREFIX[summary.kind], crypto.randomUUID()));
    setStep(lastStep);
    window.scrollTo({ top: 0 });
  }

  function createTourHold() {
    setFormError(undefined);
    startTransition(async () => {
      const result = await createTourBookingAction({
        ...contact,
        ...summary.tour,
      });
      if (result.status === "success" && result.data) {
        setHold(result.data);
        setStep(1);
        window.scrollTo({ top: 0 });
        return;
      }
      const fieldErrors = result.fieldErrors ?? {};
      setErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([k, v]) => [k, v[0]]),
        ) as ContactErrors,
      );
      setFormError(
        result.formError ??
          (fieldErrors.departureId || fieldErrors.guests
            ? "Lựa chọn tour không hợp lệ, vui lòng chọn lại."
            : undefined),
      );
    });
  }

  function payTour(bookingCode: string) {
    setFormError(undefined);
    startTransition(async () => {
      const result = await startTourPaymentAction(bookingCode);
      if (result.status === "success" && result.data) {
        window.location.assign(result.data.approveUrl);
        return;
      }
      setFormError(result.formError ?? "Không thể khởi tạo thanh toán.");
    });
  }

  function next() {
    if (step === 0) {
      const found = validateContact(contact);
      setErrors(found);
      if (Object.keys(found).length) return;
      if (summary.kind === "tour") createTourHold();
      else if (needsPayment) setStep(1);
      else finish();
    } else if (step === 1) {
      if (!agreed) {
        setAgreeError("Vui lòng đồng ý điều khoản để tiếp tục");
        return;
      }
      if (hold) payTour(hold.code);
      else finish();
    }
  }

  const errorBox = formError && (
    <p className="mb-3 rounded bg-new-coral/10 p-3 text-sm text-new-coral" role="alert">
      {formError}
    </p>
  );

  const action =
    step === 0 ? (
      <>
        {errorBox}
        <button
          className={PRIMARY_BTN}
          disabled={pending}
          onClick={next}
          type="button"
        >
          {pending
            ? "Đang giữ chỗ..."
            : needsPayment
              ? "Tiếp tục"
              : "Xác nhận đặt bàn"}
        </button>
      </>
    ) : (
      <div className="flex flex-col gap-3">
        {errorBox}
        {holdExpired ? (
          <Link className={`${PRIMARY_BTN} text-center`} href={summary.backHref}>
            Đặt lại tour
          </Link>
        ) : (
          <button
            className={PRIMARY_BTN}
            disabled={pending}
            onClick={next}
            type="button"
          >
            {pending ? "Đang chuyển sang PayPal..." : "Thanh toán với PayPal"}
          </button>
        )}
        {/* Booking tour đã giữ chỗ với thông tin liên hệ hiện tại → không cho sửa */}
        {!hold && (
          <button
            className="cursor-pointer text-sm font-medium text-new-teal"
            onClick={() => setStep(0)}
            type="button"
          >
            ← Quay lại thông tin liên hệ
          </button>
        )}
      </div>
    );

  return (
    <>
      <PageBanner
        items={[
          { label: "Trang chủ", href: "/" },
          { label: summary.name, href: summary.backHref },
          { label: `Đặt ${KIND_LABEL[summary.kind].toLowerCase()}` },
        ]}
        title="Hoàn tất đặt chỗ"
      >
        <BookingStepper current={step} steps={steps} />
      </PageBanner>

      <section className="page-x py-12">
        {step === lastStep ? (
          <CompleteStep code={code} contact={contact} summary={summary} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div>
              <h3 className="mb-6 text-2xl font-bold text-new-title">
                {step === 0 ? "Thông tin liên hệ" : "Thanh toán"}
              </h3>
              {step === 0 ? (
                <ContactForm
                  errors={errors}
                  onChange={setContact}
                  values={contact}
                />
              ) : (
                <PaymentStep
                  agreed={agreed}
                  error={agreeError}
                  notice={hold && <HoldCountdown remaining={remaining} />}
                  onAgreeChange={(v) => {
                    setAgreed(v);
                    setAgreeError(undefined);
                  }}
                  totalAmount={summary.totalAmount ?? 0}
                  usdRate={usdRate}
                />
              )}
            </div>
            <BookingSummaryCard summary={summary}>{action}</BookingSummaryCard>
          </div>
        )}
      </section>
    </>
  );
}
