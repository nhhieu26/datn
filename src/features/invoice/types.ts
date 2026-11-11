import type { BookingStatus } from "@/generated/prisma/client";

export type InvoiceKind = "tour" | "hotel";

export type InvoiceLineItem = {
  service: string;
  detail: string;
  unitLabel: string;
  unitPrice: number;
  quantity: number;
  amount: number;
};

export type InvoiceData = {
  kind: InvoiceKind;
  code: string;
  status: BookingStatus;
  issuedAt: string;
  customer: { name: string; email: string; phone: string };
  provider: { businessName: string; address: string | null; taxCode: string | null };
  seller: {
    name: string;
    tagline: string;
    address: string;
    email: string;
    phone: string;
  };
  items: InvoiceLineItem[];
  subtotal: number;
  refunded: number;
  total: number;
  payment: {
    gateway: string;
    orderId: string;
    chargedAmount: number;
    chargedCurrency: string;
    paidAt: string | null;
  };
  note: string | null;
};
