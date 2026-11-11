import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { ReactNode } from "react";
import type { InvoiceData } from "../types";
import { InvoiceActions } from "./invoice-actions";

const KIND_LABEL = { tour: "Đặt tour", hotel: "Đặt phòng khách sạn" } as const;

function formatCharged(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function Label({ children }: { children: ReactNode }) {
  return <strong className="font-bold">{children}</strong>;
}

const cell = "border border-[#ddd] p-2.5 text-left align-top text-sm";
const sub = "block text-xs text-[#888]";

/** Hóa đơn của một booking — bố cục theo mẫu Travelloo, giữ nguyên khi in. */
export function InvoiceSheet({ invoice }: { invoice: InvoiceData }) {
  return (
    <article className="invoice-sheet mx-auto w-full max-w-220 rounded bg-white p-6 font-[Arial,sans-serif] text-sm text-black shadow-[0_2px_10px_rgba(0,0,0,0.1)] sm:p-12.5">
      {/* Header */}
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold text-[#017b6e] uppercase">{invoice.seller.name}</h1>
          <p className="m-0 text-sm text-[#555]">{invoice.seller.tagline}</p>
        </div>
        <div className="sm:text-right">
          <p>
            <Label>Số hóa đơn:</Label> #{invoice.code}
          </p>
          <p>
            <Label>Ngày:</Label> {formatDate(invoice.issuedAt)}
          </p>
        </div>
      </header>

      <hr className="my-5 border-0 border-t border-dashed border-[#ccc]" />

      {/* Parties */}
      <section className="mb-5 flex flex-col gap-5 text-[#555] sm:flex-row sm:justify-between">
        <div>
          <p>
            <Label>Khách hàng:</Label>
          </p>
          <p>{invoice.customer.name}</p>
          <p>Email: {invoice.customer.email}</p>
          <p>Điện thoại: {invoice.customer.phone}</p>
        </div>
        <div className="sm:text-right">
          <p>
            <Label>{invoice.seller.name} :</Label>
          </p>
          <p>{invoice.seller.address}</p>
          <p>Email: {invoice.seller.email}</p>
          <p>Điện thoại: {invoice.seller.phone}</p>
          <p className="mt-2">
            <Label>Nhà cung cấp dịch vụ:</Label> {invoice.provider.businessName}
          </p>
          {invoice.provider.taxCode && <p>MST: {invoice.provider.taxCode}</p>}
          {invoice.provider.address && <p>{invoice.provider.address}</p>}
        </div>
      </section>

      {/* Items */}
      <div className="mb-5 overflow-x-auto">
        <table className="w-full min-w-150 border-collapse">
          <thead>
            <tr>
              {["STT", "Dịch vụ", "Chi tiết", "Đơn giá", "SL", "Thành tiền"].map((h) => (
                <th key={h} className={`${cell} bg-[#f1f1f1] font-bold whitespace-nowrap`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i}>
                <td className={cell}>{String(i + 1).padStart(2, "0")}</td>
                <td className={cell}>
                  {item.service}
                  <span className={sub}>{KIND_LABEL[invoice.kind]}</span>
                </td>
                <td className={cell}>{item.detail}</td>
                <td className={`${cell} whitespace-nowrap`}>
                  {formatCurrency(item.unitPrice)}
                  <span className={sub}>
                    {invoice.kind === "hotel" ? "/ phòng / đêm" : "/ khách"}
                  </span>
                </td>
                <td className={`${cell} whitespace-nowrap`}>
                  {item.quantity}
                  <span className={sub}>{item.unitLabel}</span>
                </td>
                <td className={`${cell} whitespace-nowrap`}>{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment + totals */}
      <section className="mb-5 flex flex-col gap-5 sm:flex-row sm:justify-between">
        <div className="text-[#555]">
          <p>
            <Label>Thông tin thanh toán:</Label>
          </p>
          <p>
            Cổng thanh toán: <span className="uppercase">{invoice.payment.gateway}</span>
          </p>
          <p>Mã giao dịch: {invoice.payment.orderId}</p>
          <p>
            Số tiền đã trả:{" "}
            {formatCharged(invoice.payment.chargedAmount, invoice.payment.chargedCurrency)}
          </p>
          <p>Thời gian: {formatDateTime(invoice.payment.paidAt)}</p>
        </div>
        <div className="sm:text-right">
          <p>
            <Label>Tạm tính:</Label> {formatCurrency(invoice.subtotal)}
          </p>
          <p>
            <Label>Giảm giá:</Label> {formatCurrency(0)}
          </p>
          {invoice.refunded > 0 && (
            <p>
              <Label>Đã hoàn tiền:</Label> −{formatCurrency(invoice.refunded)}
            </p>
          )}
          <hr className="my-2.5 border-0 border-t border-[#ccc]" />
          <p>
            <Label>Tổng cộng:</Label> {formatCurrency(invoice.total)}
          </p>
          <p className="text-xs text-[#888]">Giá đã bao gồm thuế và phí dịch vụ.</p>
        </div>
      </section>

      {/* Signature */}
      <section className="mb-7.5 max-w-50 text-center">
        <p>{invoice.seller.name}</p>
        <hr className="mx-auto my-2.5 w-50 border-0 border-t border-[#999]" />
        <p>Chữ ký</p>
      </section>

      <p className="mb-5 text-center text-[#555]">
        {invoice.note
          ? `Ghi chú: ${invoice.note}`
          : `Cảm ơn bạn đã đặt dịch vụ qua ${invoice.seller.name}. Vui lòng xuất trình mã ${invoice.code} khi sử dụng dịch vụ.`}
      </p>

      <InvoiceActions />
    </article>
  );
}
