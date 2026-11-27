import type { BookingStatus } from "@/generated/prisma/enums";
import type { InvoiceKind } from "./types";

// Dùng được ở client component: không import repo / prisma.

/** Loại booking theo tiền tố mã; null nếu không xuất hóa đơn được (vd. đặt bàn RB-). */
export function invoiceKindOf(code: string): InvoiceKind | null {
  if (code.startsWith("TB-")) return "tour";
  if (code.startsWith("HB-")) return "hotel";
  return null;
}

// Trạng thái chắc chắn đã có thanh toán thành công
const INVOICED_STATUSES: ReadonlySet<BookingStatus> = new Set([
  "paid",
  "confirmed",
  "completed",
]);

/** Booking tour/khách sạn đã thanh toán → có hóa đơn. */
export function hasInvoice(code: string, status: BookingStatus) {
  return invoiceKindOf(code) !== null && INVOICED_STATUSES.has(status);
}

const enc = encodeURIComponent;

export const invoiceHref = {
  customer: (code: string) => `/bookings/${enc(code)}/invoice`,
  provider: (code: string) => {
    const kind = invoiceKindOf(code);
    return `/provider/bookings/${kind === "hotel" ? "hotels" : "tours"}/${enc(code)}/invoice`;
  },
  admin: (code: string) => `/admin/bookings/${enc(code)}/invoice`,
};
