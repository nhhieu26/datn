import type { TransactionStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type RecentTransactionKind = "payment" | "refund";

export type RecentTransaction = {
  id: string;
  kind: RecentTransactionKind;
  // Mã hiển thị: mã đơn PayPal (thanh toán) hoặc mã hoàn tiền
  reference: string;
  bookingCode: string;
  // VND
  amount: number;
  // Số tiền thực trừ/hoàn qua cổng (thường USD)
  chargedAmount: number;
  chargedCurrency: string;
  status: TransactionStatus;
  date: Date;
};

const bookingCodes = {
  tourBooking: { select: { code: true } },
  hotelBooking: { select: { code: true } },
} as const;

/** `take` giao dịch (thanh toán + hoàn tiền) mới nhất của khách hàng. */
export async function findRecentTransactionsForCustomer(
  customerId: string,
  take: number,
): Promise<RecentTransaction[]> {
  const where = {
    OR: [{ tourBooking: { customerId } }, { hotelBooking: { customerId } }],
  };
  const page = { where, orderBy: { createdAt: "desc" }, take } as const;

  const [payments, refunds] = await Promise.all([
    // Bỏ các payment "pending" (đơn PayPal tạo ra nhưng khách chưa thanh toán)
    prisma.payment.findMany({
      ...page,
      where: { ...where, status: { not: "pending" } },
      include: bookingCodes,
    }),
    prisma.refund.findMany({ ...page, include: bookingCodes }),
  ]);

  const rows: RecentTransaction[] = [
    ...payments.map((p) => ({
      id: p.id,
      kind: "payment" as const,
      reference: p.gatewayOrderId,
      bookingCode: p.tourBooking?.code ?? p.hotelBooking?.code ?? "—",
      amount: Number(p.amount),
      chargedAmount: Number(p.chargedAmount),
      chargedCurrency: p.chargedCurrency,
      status: p.status,
      date: p.paidAt ?? p.createdAt,
    })),
    ...refunds.map((r) => ({
      id: r.id,
      kind: "refund" as const,
      reference: r.gatewayRefundId ?? `RF-${r.id.slice(0, 8).toUpperCase()}`,
      bookingCode: r.tourBooking?.code ?? r.hotelBooking?.code ?? "—",
      amount: Number(r.amount),
      chargedAmount: Number(r.chargedAmount),
      chargedCurrency: r.chargedCurrency,
      status: r.status,
      date: r.processedAt ?? r.createdAt,
    })),
  ];

  return rows.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, take);
}
