import { hotelBookingRepo } from "@/entities/hotel-booking";
import { systemSettingRepo } from "@/entities/system-setting";
import { tourBookingRepo } from "@/entities/tour-booking";
import { formatDate } from "@/lib/utils";
import type { InvoiceScope } from "@/shared/lib/invoice-scope";
import { invoiceKindOf } from "./links";
import type { InvoiceData, InvoiceKind, InvoiceLineItem } from "./types";

type Money = { toString(): string } | number;

const toNumber = (value: Money) => Number(value);

type BookingCommon = {
  code: string;
  status: InvoiceData["status"];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  note: string | null;
  totalAmount: Money;
  createdAt: Date;
  providerProfile: InvoiceData["provider"];
  payments: {
    status: string;
    gateway: string;
    gatewayOrderId: string;
    chargedAmount: Money;
    chargedCurrency: string;
    paidAt: Date | null;
  }[];
  refunds: { status: string; amount: Money }[];
};

async function loadBooking(
  kind: InvoiceKind,
  code: string,
  scope: InvoiceScope,
): Promise<{ booking: BookingCommon; items: InvoiceLineItem[] } | null> {
  if (kind === "tour") {
    const booking = await tourBookingRepo.findInvoiceByCode(code, scope);
    if (!booking) return null;
    return {
      booking,
      items: [
        {
          service: booking.tourTitle,
          detail: `Khởi hành ${formatDate(booking.departureDate)}`,
          unitLabel: "khách",
          unitPrice: toNumber(booking.unitPrice),
          quantity: booking.guests,
          amount: toNumber(booking.totalAmount),
        },
      ],
    };
  }

  const booking = await hotelBookingRepo.findInvoiceByCode(code, scope);
  if (!booking) return null;
  return {
    booking,
    items: [
      {
        service: `${booking.hotelName} — ${booking.roomName}`,
        detail: `${formatDate(booking.checkInDate)} → ${formatDate(booking.checkOutDate)} · ${booking.guests} khách`,
        unitLabel: `${booking.roomQuantity} phòng × ${booking.nights} đêm`,
        unitPrice: toNumber(booking.unitPrice),
        quantity: booking.roomQuantity * booking.nights,
        amount: toNumber(booking.totalAmount),
      },
    ],
  };
}

/**
 * Dữ liệu hóa đơn của booking tour/khách sạn đã thanh toán thành công.
 * Trả null nếu không tìm thấy trong phạm vi quyền, không phải tour/khách sạn,
 * hoặc chưa có thanh toán thành công.
 */
export async function getInvoice(
  rawCode: string,
  scope: InvoiceScope,
): Promise<InvoiceData | null> {
  const code = decodeURIComponent(rawCode);
  const kind = invoiceKindOf(code);
  if (!kind) return null;

  const [loaded, settings] = await Promise.all([
    loadBooking(kind, code, scope),
    systemSettingRepo.getSettings(),
  ]);
  if (!loaded) return null;

  const { booking, items } = loaded;
  const payment = booking.payments.find((p) => p.status === "succeeded");
  if (!payment) return null;

  const subtotal = toNumber(booking.totalAmount);
  const refunded = booking.refunds
    .filter((r) => r.status === "succeeded")
    .reduce((sum, r) => sum + toNumber(r.amount), 0);

  return {
    kind,
    code: booking.code,
    status: booking.status,
    issuedAt: (payment.paidAt ?? booking.createdAt).toISOString(),
    customer: {
      name: booking.contactName,
      email: booking.contactEmail,
      phone: booking.contactPhone,
    },
    provider: booking.providerProfile,
    seller: {
      name: settings.platformName,
      tagline: settings.tagline,
      address: settings.contactAddress,
      email: settings.contactEmail,
      phone: settings.contactPhone,
    },
    items,
    subtotal,
    refunded,
    total: subtotal - refunded,
    payment: {
      gateway: payment.gateway,
      orderId: payment.gatewayOrderId,
      chargedAmount: toNumber(payment.chargedAmount),
      chargedCurrency: payment.chargedCurrency,
      paidAt: payment.paidAt?.toISOString() ?? null,
    },
    note: booking.note,
  };
}
