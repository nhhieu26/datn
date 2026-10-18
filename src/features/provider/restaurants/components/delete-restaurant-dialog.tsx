"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { formatDate } from "@/lib/utils";
import { deleteRestaurantAction } from "../actions";
import type { RestaurantListItem } from "../types";
import { RestaurantIcon } from "./restaurant-icon";

const RESTAURANT_DELETE_GRACE_DAYS = 30;

export function DeleteRestaurantDialog({
  restaurant,
  onClose,
}: {
  restaurant: RestaurantListItem;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [deleteAt] = useState(
    () =>
      new Date(Date.now() + RESTAURANT_DELETE_GRACE_DAYS * 24 * 60 * 60 * 1000),
  );

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
      const result = await deleteRestaurantAction(restaurant.id);
      if (result.status !== "success") {
        setError(result.formError ?? "Không thể xóa nhà hàng.");
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
        aria-labelledby="delete-restaurant-heading"
        aria-modal="true"
        className="relative w-full max-w-[460px] rounded-2xl border border-slate-200 bg-white p-6 text-left whitespace-normal shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        role="dialog"
      >
        <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600">
          <RestaurantIcon name="alert" className="size-5" />
        </div>
        <h2
          className="text-lg font-bold text-slate-900"
          id="delete-restaurant-heading"
        >
          Dừng và xóa nhà hàng?
        </h2>
        <p className="mt-1 text-xs font-semibold text-brand-600">
          {restaurant.code} · {restaurant.name}
        </p>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
          Nhà hàng sẽ <span className="font-semibold">dừng hoạt động ngay</span>{" "}
          và{" "}
          <span className="font-semibold">
            bị xóa sau {RESTAURANT_DELETE_GRACE_DAYS} ngày
          </span>{" "}
          (ngày {formatDate(deleteAt)}).
        </div>
        <ul className="mt-3 list-disc space-y-1 ps-5 text-sm leading-relaxed text-slate-600">
          <li>
            Nhà hàng bị ẩn khỏi trang khách hàng và không nhận đặt bàn mới.
          </li>
          <li>
            Các đơn đặt bàn đang có vẫn tiếp tục được xử lý bình thường cho tới
            khi hoàn tất.
          </li>
          <li>
            Nếu còn đơn đặt bàn chưa hoàn tất, nhà hàng chỉ bị xóa sau khi các
            đơn đó kết thúc.
          </li>
          <li>Bạn có thể khôi phục nhà hàng bất cứ lúc nào trước ngày xóa.</li>
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
            {isPending ? "Đang xử lý..." : "Dừng & xóa nhà hàng"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
