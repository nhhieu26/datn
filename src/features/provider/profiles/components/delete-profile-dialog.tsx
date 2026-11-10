"use client";

import type { ProviderProfile } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { formatEntityCode } from "@/lib/utils";
import { deleteProviderProfileAction } from "../actions";
import { ProfileIcon } from "./profile-icon";

export function DeleteProfileDialog({
  profile,
  onClose,
  onDeleted,
}: {
  profile: Pick<ProviderProfile, "id" | "businessName">;
  onClose: () => void;
  /** Mặc định: làm mới trang hiện tại rồi đóng dialog. */
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isPending, onClose]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await deleteProviderProfileAction(profile.id);
      if (result.status !== "success") {
        setError(result.formError ?? "Không thể xóa hồ sơ.");
        return;
      }
      if (onDeleted) {
        onDeleted();
        return;
      }
      router.refresh();
      onClose();
    });
  }

  // Portal ra body để overlay phủ cả sidebar (z-60)
  return createPortal(
    <div
      className="fixed inset-0 z-80 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
      onClick={() => {
        if (!isPending) onClose();
      }}
      role="presentation"
    >
      <form
        aria-labelledby="delete-profile-heading"
        aria-modal="true"
        className="relative w-full max-w-[460px] rounded-2xl border border-slate-200 bg-white p-6 text-left whitespace-normal shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        role="dialog"
      >
        <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600">
          <ProfileIcon name="alert" className="size-5" />
        </div>
        <h2
          className="text-lg font-bold text-slate-900"
          id="delete-profile-heading"
        >
          Xóa hồ sơ doanh nghiệp?
        </h2>
        <p className="mt-1 text-xs font-semibold text-primary-600">
          {formatEntityCode("PR", profile.id)} · {profile.businessName}
        </p>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
          Hồ sơ sẽ bị <span className="font-semibold">xóa vĩnh viễn</span> và{" "}
          <span className="font-semibold">không thể khôi phục</span>.
        </div>
        <ul className="mt-3 list-disc space-y-1 ps-5 text-sm leading-relaxed text-slate-600">
          <li>
            Chỉ xóa được khi hồ sơ không còn dịch vụ nào và chưa có lịch sử đặt
            chỗ hay thanh toán.
          </li>
          <li>
            Sau khi xóa, bạn có thể tạo hồ sơ mới cho loại hình này và gửi thẩm
            định lại từ đầu.
          </li>
        </ul>

        {error ? (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            Quay lại
          </button>
          <button
            className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Đang xóa..." : "Xóa hồ sơ"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
