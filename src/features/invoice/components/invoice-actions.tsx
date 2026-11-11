"use client";

const buttonClass =
  "m-1.25 cursor-pointer rounded-[5px] border-0 bg-[#017b6e] px-5 py-2.5 text-sm text-white transition-opacity hover:opacity-90 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#017b6e]/40";

/** Nút In / Tải PDF — dùng hộp thoại in của trình duyệt (chọn "Lưu dưới dạng PDF"). */
export function InvoiceActions() {
  return (
    <div className="text-center print:hidden">
      <button className={buttonClass} onClick={() => window.print()} type="button">
        In hóa đơn
      </button>
      <button className={buttonClass} onClick={() => window.print()} type="button">
        Tải PDF
      </button>
    </div>
  );
}
