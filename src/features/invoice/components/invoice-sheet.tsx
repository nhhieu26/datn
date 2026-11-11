import { getBookingStatusMeta } from "@/features/provider/tour-bookings/utils";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { ReactNode } from "react";
import type { InvoiceData } from "../types";

const KIND_LABEL = { tour: "Đặt tour", hotel: "Đặt phòng khách sạn" } as const;

function formatCharged(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function Label({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-slate-800">{children}</span>;
}

/** Hóa đơn của một booking — trang giấy trắng, giữ nguyên khi in. */
export function InvoiceSheet({ invoice }: { invoice: InvoiceData }) {
  const status = getBookingStatusMeta(invoice.status);

  return (
    <article className="invoice-sheet mx-auto w-full max-w-205 rounded-lg bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200 sm:p-10">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-dashed border-slate-300 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-2xl font-bold tracking-wide text-new-teal uppercase">
            {invoice.seller.name}
          </p>
          <p className="mt-0.5 max-w-sm text-xs text-slate-500">{invoice.seller.tagline}</p>
        </div>
        <div className="space-y-0.5 sm:text-right">
          <p className="text-lg font-bold text-slate-800">HÓA ĐƠN</p>
          <p>
            <Label>Số hóa đơn:</Label> #{invoice.code}
          </p>
          <p>
            <Label>Ngày:</Label> {formatDate(invoice.issuedAt)}
          </p>
          <span
            className={`mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      </header>

      {/* Parties */}
      <section className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-800">Khách hàng:</p>
          <p className="font-medium text-slate-700">{invoice.customer.name}</p>
          <p>Email: {invoice.customer.email}</p>
          <p>Điện thoại: {invoice.customer.phone}</p>
        </div>
        <div className="space-y-0.5 sm:text-right">
          <p className="font-semibold text-slate-800">{invoice.seller.name}:</p>
          <p>{invoice.seller.address}</p>
          <p>Email: {invoice.seller.email}</p>
          <p>Điện thoại: {invoice.seller.phone}</p>
          <p className="pt-1">
            <Label>Nhà cung cấp dịch vụ:</Label> {invoice.provider.businessName}
          </p>
          {invoice.provider.taxCode && <p>MST: {invoice.provider.taxCode}</p>}
          {invoice.provider.address && <p>{invoice.provider.address}</p>}
        </div>
      </section>

      {/* Items */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-150 border-collapse border border-slate-200 text-left">
          <thead className="bg-slate-100 text-slate-800">
            <tr>
              {["STT", "Dịch vụ", "Chi tiết", "Đơn giá", "SL", "Thành tiền"].map((h) => (
                <th
                  key={h}
                  className="border border-slate-200 px-3 py-2.5 font-semibold whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i}>
                <td className="border border-slate-200 px-3 py-2.5">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="border border-slate-200 px-3 py-2.5 text-slate-800">
                  {item.service}
                  <span className="block text-xs text-slate-500">{KIND_LABEL[invoice.kind]}</span>
                </td>
                <td className="border border-slate-200 px-3 py-2.5">{item.detail}</td>
                <td className="border border-slate-200 px-3 py-2.5 whitespace-nowrap">
                  {formatCurrency(item.unitPrice)}
                  <span className="block text-xs text-slate-500">
                    {invoice.kind === "hotel" ? "/ phòng / đêm" : "/ khách"}
                  </span>
                </td>
                <td className="border border-slate-200 px-3 py-2.5 whitespace-nowrap">
                  {item.quantity}
                  <span className="block text-xs text-slate-500">{item.unitLabel}</span>
                </td>
                <td className="border border-slate-200 px-3 py-2.5 whitespace-nowrap text-slate-800">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment + totals */}
      <section className="mt-6 flex flex-col gap-6 sm:flex-row sm:justify-between">
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-800">Thông tin thanh toán:</p>
          <p>Cổng thanh toán: <span className="uppercase">{invoice.payment.gateway}</span></p>
          <p>Mã giao dịch: {invoice.payment.orderId}</p>
          <p>
            Số tiền đã trả:{" "}
            {formatCharged(invoice.payment.chargedAmount, invoice.payment.chargedCurrency)}
          </p>
          <p>Thời gian: {formatDateTime(invoice.payment.paidAt)}</p>
        </div>
        <div className="min-w-60 space-y-1 text-base sm:text-right">
          <p>
            <Label>Tạm tính:</Label> {formatCurrency(invoice.subtotal)}
          </p>
          <p>
            <Label>Giảm giá:</Label> {formatCurrency(0)}
          </p>
          {invoice.refunded > 0 && (
            <p className="text-rose-600">
              <Label>Đã hoàn tiền:</Label> −{formatCurrency(invoice.refunded)}
            </p>
          )}
          <p className="mt-2 border-t border-slate-300 pt-2 text-lg">
            <span className="font-bold text-slate-900">Tổng cộng:</span>{" "}
            <span className="font-bold text-new-teal">{formatCurrency(invoice.total)}</span>
          </p>
          <p className="text-xs text-slate-500">Giá đã bao gồm thuế và phí dịch vụ.</p>
        </div>
      </section>

      {/* Signature */}
      <section className="mt-8 w-48 text-center">
        <p className="pb-2 text-base font-medium text-slate-800">{invoice.seller.name}</p>
        <p className="border-t border-slate-400 pt-2 text-slate-700">Chữ ký</p>
      </section>

      <p className="mt-8 text-center text-slate-500">
        {invoice.note
          ? `Ghi chú: ${invoice.note}`
          : `Cảm ơn bạn đã đặt dịch vụ qua ${invoice.seller.name}. Vui lòng xuất trình mã ${invoice.code} khi sử dụng dịch vụ.`}
      </p>
    </article>
  );
}
