"use client";

import {
  dangerButtonClass,
  getActionErrorMessage,
  layerButtonClass,
  primaryButtonClass,
  SettingsModal,
} from "@/features/admin/settings/components/settings-shared";
import type { UserStatus } from "@/entities/user";
import { useState, useTransition } from "react";
import { banUserAction, unbanUserAction } from "../actions";

export type StatusModalTarget = {
  id: string;
  fullname: string;
  email: string;
  status: UserStatus;
};

export function UserStatusModal({
  user,
  onClose,
  onSuccess,
}: {
  user: StatusModalTarget;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const isUnban = user.status === "banned";

  const handleConfirm = () => {
    setError("");
    startTransition(async () => {
      const result = await (isUnban
        ? unbanUserAction(user.id)
        : banUserAction(user.id));
      if (result.status !== "success") {
        setError(getActionErrorMessage(result));
        return;
      }
      onSuccess(
        isUnban
          ? `Đã mở khoá tài khoản ${user.fullname}.`
          : `Đã khoá tài khoản ${user.fullname}.`,
      );
    });
  };

  return (
    <SettingsModal title={isUnban ? "Mở khoá tài khoản" : "Khoá tài khoản"}>
      <div className="space-y-3 p-4 text-sm text-foreground">
        <p>
          {isUnban ? "Mở khoá tài khoản " : "Khoá tài khoản "}
          <span className="font-semibold">{user.fullname}</span> ({user.email})?
        </p>
        <p className="text-muted-foreground-1">
          {isUnban
            ? "Người dùng sẽ đăng nhập và sử dụng hệ thống lại bình thường."
            : "Người dùng sẽ bị đăng xuất ngay và không thể đăng nhập cho tới khi được mở khoá. Dữ liệu của họ được giữ nguyên."}
        </p>
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex items-center justify-end gap-x-2 border-t border-overlay-line px-4 py-3">
        <button
          className={layerButtonClass}
          disabled={isPending}
          onClick={onClose}
          type="button"
        >
          Huỷ
        </button>
        <button
          className={isUnban ? primaryButtonClass : dangerButtonClass}
          disabled={isPending}
          onClick={handleConfirm}
          type="button"
        >
          {isPending ? "Đang xử lý…" : isUnban ? "Mở khoá" : "Khoá tài khoản"}
        </button>
      </div>
    </SettingsModal>
  );
}
