"use client";

import type { ContactValues } from "../types";

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const INPUT =
  "w-full rounded border border-new-input-border bg-white px-4 py-3 text-new-title placeholder:text-new-placeholder focus:border-new-teal focus:ring-0";

export function validateContact(v: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (!v.contactName.trim()) errors.contactName = "Vui lòng nhập họ tên";
  if (!/^\S+@\S+\.\S+$/.test(v.contactEmail.trim()))
    errors.contactEmail = "Email không hợp lệ";
  if (!/^(\+84|0)\d{9,10}$/.test(v.contactPhone.replace(/\s/g, "")))
    errors.contactPhone = "Số điện thoại không hợp lệ";
  return errors;
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className ?? ""}`}>
      <span className="text-sm font-medium text-new-paragraph">{label}</span>
      {children}
      {error && <span className="text-sm text-new-coral">{error}</span>}
    </label>
  );
}

export function ContactForm({
  values,
  errors,
  onChange,
}: {
  values: ContactValues;
  errors: ContactErrors;
  onChange: (next: ContactValues) => void;
}) {
  const bind = (key: keyof ContactValues) => ({
    value: values[key],
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange({ ...values, [key]: e.target.value }),
  });

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Field label="Họ và tên" error={errors.contactName} className="sm:col-span-2">
        <input
          autoComplete="name"
          className={INPUT}
          placeholder="Nhập họ và tên"
          {...bind("contactName")}
        />
      </Field>
      <Field label="Email" error={errors.contactEmail}>
        <input
          autoComplete="email"
          className={INPUT}
          placeholder="info@gmail.com"
          type="email"
          {...bind("contactEmail")}
        />
      </Field>
      <Field label="Số điện thoại" error={errors.contactPhone}>
        <input
          autoComplete="tel"
          className={INPUT}
          placeholder="0900000000"
          type="tel"
          {...bind("contactPhone")}
        />
      </Field>
      <Field label="Ghi chú" className="sm:col-span-2">
        <textarea
          className={`${INPUT} min-h-32`}
          placeholder="Yêu cầu đặc biệt (không bắt buộc)"
          {...bind("note")}
        />
      </Field>
    </div>
  );
}
