"use client";

import { useActionState, useState } from "react";
import type { ProfileUser } from "@/entities/user";
import type { ActionState } from "@/shared/lib/action-state";
import { PasswordEyeIcon } from "@/features/customer/components/password-eye-icon";
import { changePasswordAction, updateProfileAction } from "../actions";

const tabs = [
  { id: "edit", label: "Chỉnh sửa hồ sơ" },
  { id: "security", label: "Bảo mật" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-6">
      <label
        htmlFor={name}
        className="mb-2 block text-base font-medium text-new-paragraph"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && visible ? "text" : type}
          value={value}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          className={`h-[49px] w-full rounded border bg-transparent px-3.5 text-base text-new-title outline-none transition-all focus:ring-1 placeholder:text-base placeholder:font-normal placeholder:text-new-placeholder ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-new-input-border focus:border-new-teal focus:ring-new-teal"
          } ${isPassword ? "pr-11" : ""}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="absolute inset-y-0 right-3 flex items-center text-new-paragraph"
          >
            <PasswordEyeIcon open={visible} />
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1.5 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function FormMessage({
  state,
  successText,
}: {
  state: ActionState<void>;
  successText: string;
}) {
  if (state.status === "error" && state.formError) {
    return (
      <p role="alert" className="mb-5 rounded bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
        {state.formError}
      </p>
    );
  }
  if (state.status === "success") {
    return (
      <p role="status" className="mb-5 rounded bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
        {successText}
      </p>
    );
  }
  return null;
}

function SubmitButtons({
  pending,
  onCancel,
}: {
  pending: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="mt-2.5 flex gap-2.5">
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-transparent bg-new-teal-cta px-[30px] py-2 text-base font-bold text-white transition-colors hover:border-new-teal-cta hover:bg-transparent hover:text-new-teal-cta disabled:opacity-60"
      >
        {pending ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={pending}
        className="rounded border border-new-teal-cta bg-transparent px-[22px] py-2 text-lg font-bold text-new-teal-cta transition-colors hover:bg-new-teal-cta hover:text-white disabled:opacity-60"
      >
        Hủy bỏ
      </button>
    </div>
  );
}

const idleState: ActionState<void> = { status: "idle" };

function EditProfileForm({
  user,
  onCancel,
}: {
  user: ProfileUser;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    idleState,
  );
  // Controlled so a failed submit doesn't get wiped by React's post-action form reset.
  const [values, setValues] = useState({
    fullname: user.fullname,
    email: user.email,
    phone: user.phone,
  });
  const set = (key: keyof typeof values) => (value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));
  const errors = state.fieldErrors;

  return (
    <form action={formAction} noValidate>
      <FormMessage state={state} successText="Cập nhật hồ sơ thành công." />
      <Field
        label="Họ và tên"
        name="fullname"
        value={values.fullname}
        onChange={set("fullname")}
        error={errors?.fullname?.[0]}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={set("email")}
        error={errors?.email?.[0]}
      />
      <Field
        label="Số điện thoại"
        name="phone"
        type="tel"
        value={values.phone}
        onChange={set("phone")}
        error={errors?.phone?.[0]}
      />
      <SubmitButtons pending={pending} onCancel={onCancel} />
    </form>
  );
}

function SecurityForm({ onCancel }: { onCancel: () => void }) {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    idleState,
  );
  const errors = state.fieldErrors;

  return (
    <form action={formAction} noValidate>
      <FormMessage state={state} successText="Đổi mật khẩu thành công." />
      <Field
        label="Mật khẩu cũ"
        name="current_password"
        type="password"
        placeholder="••••••"
        error={errors?.current_password?.[0]}
      />
      <Field
        label="Mật khẩu mới"
        name="new_password"
        type="password"
        placeholder="••••••"
        error={errors?.new_password?.[0]}
      />
      <Field
        label="Nhập lại mật khẩu"
        name="confirm_password"
        type="password"
        placeholder="••••••"
        error={errors?.confirm_password?.[0]}
      />
      <SubmitButtons pending={pending} onCancel={onCancel} />
    </form>
  );
}

export function ProfileDashboard({ user }: { user: ProfileUser }) {
  const [active, setActive] = useState<TabId>("edit");
  // Bumping the key remounts the form, discarding edits and any server messages.
  const [resetKey, setResetKey] = useState(0);
  const reset = () => setResetKey((k) => k + 1);

  return (
    <div className="rounded-md bg-new-section-bg p-6">
      <div className="rounded-md bg-white p-6">
          <ul className="mb-5 flex" role="tablist">
            {tabs.map((tab) => (
              <li key={tab.id} role="presentation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={active === tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`mb-3.5 border-b-2 px-[11px] py-2 text-base font-medium transition-colors ${
                    active === tab.id
                      ? "border-new-teal-cta text-new-teal-cta"
                      : "border-new-tab-border text-new-paragraph hover:border-new-teal-cta hover:text-new-teal-cta"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {active === "edit" ? (
            <EditProfileForm key={resetKey} user={user} onCancel={reset} />
          ) : (
            <SecurityForm key={resetKey} onCancel={reset} />
          )}
      </div>
    </div>
  );
}
