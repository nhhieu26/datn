"use client";

import { useState, useTransition } from "react";
import { formatDate } from "@/lib/utils";
import {
  changeAdminPasswordAction,
  updateAdminProfileAction,
} from "../actions";
import type { AdminProfileData } from "../types";
import {
  FieldError,
  getActionErrorMessage,
  inputClass,
  primaryButtonClass,
} from "./settings-shared";

export function AdminAccountTab({
  adminProfile,
  onProfileUpdated,
  onNotify,
}: {
  adminProfile: AdminProfileData;
  onProfileUpdated: (next: AdminProfileData) => void;
  onNotify: (message: string, variant?: "success" | "error") => void;
}) {
  const [fullname, setFullname] = useState(adminProfile.fullname);
  const [email, setEmail] = useState(adminProfile.email);
  const [phone, setPhone] = useState(adminProfile.phone);
  const [profileErrors, setProfileErrors] = useState<Record<string, string[]>>(
    {},
  );
  const [isSavingProfile, startSavingProfile] = useTransition();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<
    Record<string, string[]>
  >({});
  const [isChangingPass, startChangingPass] = useTransition();

  const handleSaveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileErrors({});
    startSavingProfile(async () => {
      const result = await updateAdminProfileAction({
        fullname,
        email,
        phone,
      });
      if (result.status === "error" || !result.data) {
        setProfileErrors(result.fieldErrors ?? {});
        onNotify(getActionErrorMessage(result), "error");
        return;
      }
      onProfileUpdated(result.data);
      onNotify("Đã cập nhật thông tin hồ sơ quản trị viên.");
    });
  };

  const handleChangePassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordErrors({});
    startChangingPass(async () => {
      const result = await changeAdminPasswordAction({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      if (result.status === "error") {
        setPasswordErrors(result.fieldErrors ?? {});
        onNotify(getActionErrorMessage(result), "error");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onNotify("Đã đổi mật khẩu tài khoản quản trị thành công.");
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Hồ sơ Admin */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-xl border border-card-line bg-card p-5 shadow-2xs sm:p-6"
      >
        <div className="flex items-center gap-3.5 border-b border-card-line pb-4">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
            {adminProfile.fullname.charAt(0).toUpperCase() || "A"}
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Hồ sơ Quản trị viên
            </h2>
            <p className="text-xs text-muted-foreground-1">
              Tài khoản tạo ngày {formatDate(adminProfile.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="adminFullname"
              className="block text-sm font-medium text-foreground"
            >
              Họ và tên
            </label>
            <input
              id="adminFullname"
              type="text"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              disabled={isSavingProfile}
              className={`${inputClass} mt-1.5`}
            />
            <FieldError errors={profileErrors.fullname} />
          </div>

          <div>
            <label
              htmlFor="adminEmail"
              className="block text-sm font-medium text-foreground"
            >
              Email đăng nhập
            </label>
            <input
              id="adminEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSavingProfile}
              className={`${inputClass} mt-1.5`}
            />
            <FieldError errors={profileErrors.email} />
          </div>

          <div>
            <label
              htmlFor="adminPhone"
              className="block text-sm font-medium text-foreground"
            >
              Số điện thoại
            </label>
            <input
              id="adminPhone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSavingProfile}
              className={`${inputClass} mt-1.5`}
            />
            <FieldError errors={profileErrors.phone} />
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-card-line pt-4">
          <button
            type="submit"
            disabled={isSavingProfile}
            className={primaryButtonClass}
          >
            {isSavingProfile ? "Đang lưu..." : "Cập nhật hồ sơ"}
          </button>
        </div>
      </form>

      {/* Đổi mật khẩu Admin */}
      <form
        onSubmit={handleChangePassword}
        className="rounded-xl border border-card-line bg-card p-5 shadow-2xs sm:p-6"
      >
        <div className="flex items-center justify-between border-b border-card-line pb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Đổi mật khẩu quản trị
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground-1">
              Mật khẩu mới cần tối thiểu 8 ký tự và khác mật khẩu hiện tại.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswords((v) => !v)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {showPasswords ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-foreground"
            >
              Mật khẩu hiện tại
            </label>
            <input
              id="currentPassword"
              type={showPasswords ? "text" : "password"}
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isChangingPass}
              className={`${inputClass} mt-1.5`}
            />
            <FieldError errors={passwordErrors.current_password} />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-foreground"
            >
              Mật khẩu mới
            </label>
            <input
              id="newPassword"
              type={showPasswords ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isChangingPass}
              className={`${inputClass} mt-1.5`}
            />
            <FieldError errors={passwordErrors.new_password} />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-foreground"
            >
              Xác nhận mật khẩu mới
            </label>
            <input
              id="confirmPassword"
              type={showPasswords ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isChangingPass}
              className={`${inputClass} mt-1.5`}
            />
            <FieldError errors={passwordErrors.confirm_password} />
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-card-line pt-4">
          <button
            type="submit"
            disabled={isChangingPass}
            className={primaryButtonClass}
          >
            {isChangingPass ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </button>
        </div>
      </form>
    </div>
  );
}
