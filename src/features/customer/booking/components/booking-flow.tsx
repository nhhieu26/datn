"use client";

import { PageBanner } from "@/features/customer/components/page-banner";
import { formatEntityCode } from "@/lib/utils";
import { useState } from "react";
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
import { PaymentStep } from "./payment-step";

const PRIMARY_BTN =
  "w-full cursor-pointer rounded bg-new-teal px-7 py-3.5 font-bold text-white transition-colors hover:bg-new-teal-hover";

export function BookingFlow({
  summary,
  initialContact,
}: {
  summary: BookingSummary;
  initialContact: ContactValues;
}) {
  const needsPayment = summary.totalAmount != null;
  const steps = stepLabels(summary.kind);
  const lastStep = steps.length - 1;

  const [step, setStep] = useState(0);
  const [contact, setContact] = useState(initialContact);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState<string>();
  const [code, setCode] = useState("");

  function finish() {
    // ponytail: UI-only, mã giả sinh ở client — thay bằng Booking.code từ server
    setCode(formatEntityCode(CODE_PREFIX[summary.kind], crypto.randomUUID()));
    setStep(lastStep);
    window.scrollTo({ top: 0 });
  }

  function next() {
    if (step === 0) {
      const found = validateContact(contact);
      setErrors(found);
      if (Object.keys(found).length) return;
      if (needsPayment) setStep(1);
      else finish();
    } else if (step === 1) {
      if (!agreed) {
        setAgreeError("Vui lòng đồng ý điều khoản để tiếp tục");
        return;
      }
      finish();
    }
  }

  const action =
    step === 0 ? (
      <button className={PRIMARY_BTN} onClick={next} type="button">
        {needsPayment ? "Tiếp tục" : "Xác nhận đặt bàn"}
      </button>
    ) : (
      <div className="flex flex-col gap-3">
        <button className={PRIMARY_BTN} onClick={next} type="button">
          Thanh toán với PayPal
        </button>
        <button
          className="cursor-pointer text-sm font-medium text-new-teal"
          onClick={() => setStep(0)}
          type="button"
        >
          ← Quay lại thông tin liên hệ
        </button>
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
                  onAgreeChange={(v) => {
                    setAgreed(v);
                    setAgreeError(undefined);
                  }}
                  totalAmount={summary.totalAmount ?? 0}
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
