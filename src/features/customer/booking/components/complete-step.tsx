import { formatVnd } from "@/features/customer/components/cards/card-parts";
import Link from "next/link";
import { KIND_LABEL } from "../lib/booking-labels";
import type { BookingSummary, ContactValues } from "../types";

export function CompleteStep({
  summary,
  contact,
  code,
}: {
  summary: BookingSummary;
  contact: ContactValues;
  code: string;
}) {
  const paid = summary.totalAmount != null;
  const rows = [
    { label: "Mã đặt chỗ", value: code },
    { label: "Loại", value: KIND_LABEL[summary.kind] },
    { label: summary.name, value: summary.location },
    { label: summary.highlight.label, value: summary.highlight.value },
    ...summary.rows,
    { label: "Người đặt", value: contact.contactName },
    { label: "Email", value: contact.contactEmail },
    { label: "Số điện thoại", value: contact.contactPhone },
    ...(contact.note.trim() ? [{ label: "Ghi chú", value: contact.note }] : []),
    {
      label: "Trạng thái",
      value: paid ? "Đã thanh toán" : "Đã xác nhận",
    },
    ...(paid ? [{ label: "Thanh toán", value: "PayPal" }] : []),
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div>
        <h3 className="mb-3 text-2xl font-bold text-new-title">
          Đặt chỗ thành công
        </h3>
        <p className="mb-8 text-new-paragraph">
          Cảm ơn bạn đã đặt chỗ tại Roamly! Chúng tôi đã ghi nhận đơn của bạn.
          Vui lòng kiểm tra email để xem xác nhận và thông tin chi tiết.
        </p>
        <h3 className="mb-4 text-2xl font-bold text-new-title">
          Tóm tắt đặt chỗ
        </h3>
        <div className="overflow-hidden rounded border border-new-input-border">
          {rows.map((row, i) => (
            <div
              key={`${row.label}-${i}`}
              className={`flex justify-between gap-4 px-4 py-3 text-sm ${i % 2 ? "bg-new-section-bg" : "bg-white"}`}
            >
              <span className="font-bold text-new-title">{row.label}</span>
              <span className="text-right text-new-paragraph">{row.value}</span>
            </div>
          ))}
          {paid && (
            <div className="flex justify-between bg-new-teal px-4 py-3 text-lg font-bold text-white">
              <span>Tổng cộng</span>
              <span>{formatVnd(summary.totalAmount!)}</span>
            </div>
          )}
        </div>
      </div>

      <aside className="h-fit rounded-lg bg-new-chip p-6">
        <div className="flex items-start gap-2 font-bold text-new-teal">
          <span aria-hidden className="material-symbols-outlined">
            location_on
          </span>
          <div>
            <p>{summary.name}</p>
            <p className="text-sm font-medium">{summary.location}</p>
          </div>
        </div>
        <p className="mt-4 text-new-paragraph">
          Cảm ơn bạn đã chọn Roamly! Chúng tôi rất mong được đồng hành cùng bạn
          trong hành trình sắp tới.
        </p>
        <Link
          className="mt-6 block rounded bg-new-teal px-7 py-3.5 text-center font-bold text-white transition-colors hover:bg-new-teal-hover"
          href="/"
        >
          Về trang chủ
        </Link>
        <Link
          className="mt-3 block rounded border border-new-teal px-7 py-3.5 text-center font-bold text-new-teal transition-colors hover:bg-new-teal hover:text-white"
          href={summary.backHref}
        >
          Xem lại dịch vụ
        </Link>
      </aside>
    </div>
  );
}
