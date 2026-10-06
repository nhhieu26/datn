"use client";

import { PageBanner } from "@/features/customer/components/page-banner";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  createHotelBookingAction,
  createRestaurantBookingAction,
  createTourBookingAction,
  startHotelPaymentAction,
  startTourPaymentAction,
} from "../actions";
import {
  KIND_LABEL,
  REBOOK_LABEL,
  stepLabels,
} from "../lib/booking-labels";
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
  // Booking tour / khách sạn đang giữ chỗ (đã tạo ở server)
  const [hold, setHold] = useState<Hold | null>(null);
  const [pending, startTransition] = useTransition();
  const remaining = useHoldRemaining(hold?.expiresAt ?? new Date(0).toISOString());
  const holdExpired = hold != null && remaining === 0;

  function showFieldErrors(result: {
    fieldErrors?: Record<string, string[]>;
    formError?: string;
  }) {
    const fieldErrors = result.fieldErrors ?? {};
    setErrors(
      Object.fromEntries(
        Object.entries(fieldErrors).map(([k, v]) => [k, v[0]]),
      ) as ContactErrors,
    );
    const invalidChoice = [
      "departureId",
      "roomId",
      "checkIn",
      "checkOut",
      "rooms",
      "restaurantSlug",
      "date",
      "slot",
      "guests",
    ].find((key) => fieldErrors[key]);
    setFormError(
      result.formError ??
        (invalidChoice
          ? `${fieldErrors[invalidChoice][0]}. Vui lòng chọn lại.`
          : undefined),
    );
  }

  /** Nhà hàng không thanh toán online: tạo đơn confirmed rồi sang bước hoàn tất. */
  function reserveTable() {
    setFormError(undefined);
    startTransition(async () => {
      const result = await createRestaurantBookingAction({
        ...contact,
        ...summary.restaurant,
      });
      if (result.status === "success" && result.data) {
        setCode(result.data.code);
        setStep(lastStep);
        window.scrollTo({ top: 0 });
        return;
      }
      showFieldErrors(result);
    });
  }

  function createHold() {
    setFormError(undefined);
    startTransition(async () => {
      const result =
        summary.kind === "hotel"
          ? await createHotelBookingAction({ ...contact, ...summary.hotel })
          : await createTourBookingAction({ ...contact, ...summary.tour });
      if (result.status === "success" && result.data) {
        setHold(result.data);
        setStep(1);
        window.scrollTo({ top: 0 });
        return;
      }
      showFieldErrors(result);
    });
  }

  function pay(bookingCode: string) {
    setFormError(undefined);
    startTransition(async () => {
      const start =
        summary.kind === "hotel" ? startHotelPaymentAction : startTourPaymentAction;
      const result = await start(bookingCode);
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
      if (summary.kind === "restaurant") reserveTable();
      else createHold();
    } else if (step === 1) {
      if (!agreed) {
        setAgreeError("Vui lòng đồng ý điều khoản để tiếp tục");
        return;
      }
      if (hold) pay(hold.code);
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
            ? needsPayment
              ? "Đang giữ chỗ..."
              : "Đang đặt bàn..."
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
            {REBOOK_LABEL[summary.kind]}
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
        {/* Booking đã giữ chỗ với thông tin liên hệ hiện tại → không cho sửa */}
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
