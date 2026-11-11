"use client";

const buttonClass =
  "inline-flex items-center gap-1.5 rounded bg-new-teal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-new-teal-hover focus:outline-hidden focus-visible:ring-2 focus-visible:ring-new-teal/40";

/** Nút In / Tải PDF — dùng hộp thoại in của trình duyệt (chọn "Lưu dưới dạng PDF"). */
export function InvoiceActions() {
  return (
    <div className="flex justify-center gap-3 print:hidden">
      <button className={buttonClass} onClick={() => window.print()} type="button">
        In hóa đơn
      </button>
      <button className={buttonClass} onClick={() => window.print()} type="button">
        Tải PDF
      </button>
    </div>
  );
}
