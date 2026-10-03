"use client";

import { useState } from "react";
import type { ProfileUser } from "@/entities/user";

const tabs = [
  { id: "edit", label: "Chỉnh sửa hồ sơ" },
  { id: "security", label: "Bảo mật" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="mb-6">
      <label
        htmlFor={name}
        className="mb-2 block text-base font-medium text-new-paragraph"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-[49px] w-full rounded border border-new-input-border bg-transparent px-3.5 text-base text-new-title outline-none transition-all focus:border-new-teal focus:ring-1 focus:ring-new-teal placeholder:text-base placeholder:font-normal placeholder:text-new-placeholder"
      />
    </div>
  );
}

function SubmitButtons() {
  return (
    <div className="mt-2.5 flex gap-2.5">
      <button
        type="submit"
        className="rounded border border-transparent bg-new-teal-cta px-[30px] py-2 text-base font-bold text-white transition-colors hover:border-new-teal-cta hover:bg-transparent hover:text-new-teal-cta"
      >
        Lưu thay đổi
      </button>
      <button
        type="button"
        className="rounded border border-new-teal-cta bg-transparent px-[22px] py-2 text-lg font-bold text-new-teal-cta transition-colors hover:bg-new-teal-cta hover:text-white"
      >
        Hủy bỏ
      </button>
    </div>
  );
}

function EditProfileForm({ user }: { user: ProfileUser }) {
  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <Field label="Họ và tên" name="name" defaultValue={user.fullname} />
      <Field label="Email" name="email" type="email" defaultValue={user.email} />
      <Field
        label="Số điện thoại"
        name="phone"
        type="tel"
        defaultValue={user.phone}
      />
      <SubmitButtons />
    </form>
  );
}

function SecurityForm() {
  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <Field
        label="Mật khẩu cũ"
        name="password-old"
        type="password"
        placeholder="••••••"
      />
      <Field
        label="Mật khẩu mới"
        name="password-new"
        type="password"
        placeholder="••••••"
      />
      <Field
        label="Nhập lại mật khẩu"
        name="password-reenter"
        type="password"
        placeholder="••••••"
      />
      <SubmitButtons />
    </form>
  );
}

export function ProfileDashboard({ user }: { user: ProfileUser }) {
  const [active, setActive] = useState<TabId>("edit");

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
            <EditProfileForm user={user} />
          ) : (
            <SecurityForm />
          )}
      </div>
    </div>
  );
}
