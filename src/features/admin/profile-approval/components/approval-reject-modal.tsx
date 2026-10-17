"use client";

import { useState } from "react";
import type { ApprovalProfile } from "../types";
import { ApprovalIcon } from "./approval-icon";
import { layerButtonClass } from "./approval-shared";

export function ApprovalRejectModal({
  profile,
  isPending,
  onClose,
  onConfirm,
}: {
  profile: ApprovalProfile;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState(profile.rejectionReason ?? "");
  const canSubmit = reason.trim().length > 0 && !isPending;

  return (
    <div
      aria-labelledby="hs-reject-modal-label"
      aria-modal="true"
      className="fixed inset-0 z-80 flex items-center justify-center overflow-y-auto bg-gray-900/50 p-4"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="flex w-full max-w-lg flex-col rounded-xl border border-overlay-line bg-overlay shadow-2xs"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-overlay-divider px-4 py-3">
          <h3
            className="font-semibold text-foreground"
            id="hs-reject-modal-label"
          >
            Từ chối hồ sơ
          </h3>
          <button
            aria-label="Đóng"
            className="inline-flex size-8 items-center justify-center rounded-full border border-transparent bg-surface text-surface-foreground hover:bg-surface-hover focus:bg-surface-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            <ApprovalIcon name="close" className="size-4" />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <p className="text-sm text-muted-foreground-2">
            Lý do sẽ được gửi lại cho{" "}
            <span className="font-semibold text-foreground">
              {profile.businessName}
            </span>{" "}
            để đối tác bổ sung và nộp lại hồ sơ.
          </p>
          <label className="sr-only" htmlFor="hs-reject-reason">
            Lý do từ chối
          </label>
          <textarea
            autoFocus
            className="block min-h-28 w-full resize-y rounded-lg border-layer-line bg-layer px-3 py-2 text-foreground placeholder:text-muted-foreground-1 focus:border-primary-focus focus:ring-primary-focus disabled:pointer-events-none disabled:opacity-50 sm:text-sm"
            disabled={isPending}
            id="hs-reject-reason"
            maxLength={1000}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Nhập lý do để gửi lại cho đối tác..."
            value={reason}
          />
        </div>

        <div className="flex items-center justify-end gap-x-2 border-t border-overlay-divider px-4 py-3">
          <button
            className={`px-3 py-2 ${layerButtonClass}`}
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            Hủy
          </button>
          <button
            className="inline-flex items-center justify-center gap-x-2 rounded-lg border border-transparent bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:bg-red-700 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
            disabled={!canSubmit}
            onClick={() => onConfirm(reason)}
            type="button"
          >
            <ApprovalIcon name="x" />
            Từ chối hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
}
