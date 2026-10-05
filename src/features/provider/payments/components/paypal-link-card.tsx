"use client";

import { useActionState } from "react";
import { getServiceMeta } from "@/features/provider/utils";
import type { BusinessType } from "@/generated/prisma/client";
import type { ActionState } from "@/shared/lib/action-state";
import { unlinkPayPalAction } from "../actions";

const INITIAL_STATE: ActionState = { status: "idle" };

export type PayPalLinkItem = {
  id: string;
  businessName: string;
  businessType: BusinessType;
  payoutEmail: string | null;
  linkedAt: string | null;
};

export function PayPalLinkCard({ item }: { item: PayPalLinkItem }) {
  const meta = getServiceMeta(item.businessType);
  const linked = Boolean(item.linkedAt);
  const [state, formAction, isPending] = useActionState(
    unlinkPayPalAction.bind(null, item.id),
    INITIAL_STATE,
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}
        >
          <span aria-hidden className="material-symbols-outlined text-[16px]">
            {meta.icon}
          </span>
          {meta.label}
        </span>
        <h3 className="text-lg font-bold text-slate-900">{item.businessName}</h3>
        {linked ? (
          <p className="text-sm text-slate-600">
            Đã liên kết <strong>{item.payoutEmail}</strong> ·{" "}
            {new Date(item.linkedAt!).toLocaleDateString("vi-VN")}
          </p>
        ) : (
          <p className="text-sm text-slate-500">Chưa liên kết tài khoản PayPal.</p>
        )}
        {state.status === "error" && state.formError && (
          <p className="text-[13px] font-medium text-rose-600">{state.formError}</p>
        )}
      </div>

      {linked ? (
        <form
          action={formAction}
          onSubmit={(e) => {
            if (!confirm("Hủy liên kết PayPal? Bạn sẽ không thể tạo dịch vụ mới.")) {
              e.preventDefault();
            }
          }}
        >
          <button
            className="cursor-pointer rounded-xl border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Đang xử lý..." : "Hủy liên kết"}
          </button>
        </form>
      ) : (
        // Route handler redirect sang PayPal → dùng <a>, không dùng next/link
        <a
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-600"
          href={`/api/paypal/connect?profileId=${item.id}`}
        >
          Liên kết với PayPal
        </a>
      )}
    </div>
  );
}
