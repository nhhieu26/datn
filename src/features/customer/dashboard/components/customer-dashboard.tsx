import { KIND_LABEL } from "@/features/customer/booking/lib/booking-labels";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/features/customer/components/motion";
import { MY_BOOKINGS_PATH } from "@/features/customer/reviews/paths";
import { hasInvoice, invoiceHref } from "@/features/invoice/links";
import { getBookingStatusMeta } from "@/features/provider/tour-bookings/utils";
import type { TransactionStatus } from "@/generated/prisma/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";
import type {
  CustomerDashboardBooking,
  CustomerDashboardData,
  CustomerDashboardTransaction,
} from "../types";

const th =
  "border border-new-input-border px-3 py-2.5 text-left text-sm font-semibold whitespace-nowrap text-new-title";
const td = "border border-new-input-border px-3 py-2.5 align-top text-sm text-new-paragraph";
const linkClass = "font-medium text-new-teal-cta hover:underline";

const bookingHref = (code: string) => `/bookings/${encodeURIComponent(code)}`;
const index = (i: number) => String(i + 1).padStart(2, "0");

/* ---------- Thẻ thống kê ---------- */

type StatCard = {
  label: string;
  value: number;
  icon: string;
  hint: string;
  href: string;
};

function StatCards({ stats }: { stats: CustomerDashboardData["stats"] }) {
  const cards: StatCard[] = [
    {
      label: "Tổng đơn đặt",
      value: stats.total,
      icon: "confirmation_number",
      hint: `Đã chi ${formatCurrency(stats.tour.totalPaid + stats.hotel.totalPaid)}`,
      href: MY_BOOKINGS_PATH.tour,
    },
    {
      label: "Đơn đặt tour",
      value: stats.tour.total,
      icon: "tour",
      hint: stats.tour.awaitingPayment
        ? `${stats.tour.awaitingPayment} đơn chờ thanh toán`
        : `Đã chi ${formatCurrency(stats.tour.totalPaid)}`,
      href: MY_BOOKINGS_PATH.tour,
    },
    {
      label: "Đơn đặt phòng",
      value: stats.hotel.total,
      icon: "hotel",
      hint: stats.hotel.awaitingPayment
        ? `${stats.hotel.awaitingPayment} đơn chờ thanh toán`
        : `Đã chi ${formatCurrency(stats.hotel.totalPaid)}`,
      href: MY_BOOKINGS_PATH.hotel,
    },
    {
      label: "Đơn đặt bàn",
      value: stats.restaurant.total,
      icon: "restaurant",
      hint: `${stats.restaurant.upcoming} lượt sắp tới`,
      href: MY_BOOKINGS_PATH.restaurant,
    },
  ];

  return (
    <StaggerContainer
      className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      inView={false}
      stagger={0.08}
    >
      {cards.map((card) => (
        <StaggerItem key={card.label} y={12}>
          <Link
            className="block rounded bg-white px-6 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            href={card.href}
          >
            <div className="border-b border-new-chip pb-3 text-base font-semibold text-new-title">
              {card.label}
            </div>
            <div className="flex items-center gap-2.5 pt-3 text-xl font-semibold text-new-teal-cta">
              <span aria-hidden className="material-symbols-outlined">
                {card.icon}
              </span>
              {card.value}
            </div>
            <p className="mt-1 truncate text-xs text-new-muted">{card.hint}</p>
          </Link>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

/* ---------- Khung section ---------- */

function Section({
  title,
  action,
  delay,
  children,
}: {
  title: string;
  action?: ReactNode;
  delay: number;
  children: ReactNode;
}) {
  return (
    <FadeIn className="mb-6 rounded-md bg-white p-5 last:mb-0 sm:p-6" delay={delay} inView={false}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-new-title">{title}</h2>
        {action}
      </div>
      {children}
    </FadeIn>
  );
}

function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td className={`${td} py-8 text-center`} colSpan={colSpan}>
        {children}
      </td>
    </tr>
  );
}

/* ---------- Giao dịch gần đây ---------- */

const TRANSACTION_REMARK: Record<TransactionStatus, { label: string; className: string }> = {
  succeeded: { label: "Thành công", className: "text-new-teal-cta" },
  processing: { label: "Đang xử lý", className: "text-amber-600" },
  pending: { label: "Chờ xử lý", className: "text-amber-600" },
  failed: { label: "Thất bại", className: "text-rose-600" },
};

function formatCharged(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function TransactionsTable({ rows }: { rows: CustomerDashboardTransaction[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-170 border-collapse">
        <thead>
          <tr className="bg-new-section-bg">
            {["#", "Mã giao dịch", "Đơn", "Số tiền", "Đã trả qua cổng", "Ngày", "Ghi chú"].map(
              (h) => (
                <th className={th} key={h}>
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={7}>Bạn chưa có giao dịch nào.</EmptyRow>
          ) : (
            rows.map((t, i) => {
              const remark = TRANSACTION_REMARK[t.status];
              const refund = t.kind === "refund";
              return (
                <tr key={`${t.kind}-${t.id}`}>
                  <td className={td}>{index(i)}</td>
                  <td className={`${td} max-w-44 truncate font-mono text-xs`} title={t.reference}>
                    {t.reference}
                  </td>
                  <td className={`${td} whitespace-nowrap`}>
                    <Link className={linkClass} href={bookingHref(t.bookingCode)}>
                      {t.bookingCode}
                    </Link>
                  </td>
                  <td className={`${td} whitespace-nowrap font-medium text-new-title`}>
                    {refund ? "+" : ""}
                    {formatCurrency(t.amount)}
                  </td>
                  <td className={`${td} whitespace-nowrap`}>
                    {formatCharged(t.chargedAmount, t.chargedCurrency)}
                  </td>
                  <td className={`${td} whitespace-nowrap`}>{formatDate(t.date)}</td>
                  <td className={`${td} whitespace-nowrap font-medium ${remark.className}`}>
                    {refund ? "Hoàn tiền" : "Thanh toán"} · {remark.label}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Đặt chỗ gần đây ---------- */

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="leading-relaxed">
      <span className="font-semibold text-new-title">{label}:</span> {children}
    </p>
  );
}

function BookingsTable({ rows }: { rows: CustomerDashboardBooking[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-190 border-collapse">
        <thead>
          <tr className="bg-new-section-bg">
            {["#", "Chi tiết đặt chỗ", "Nhà cung cấp", "Thanh toán", "Thao tác"].map((h) => (
              <th className={th} key={h}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={5}>
              Bạn chưa có đơn đặt chỗ nào.{" "}
              <Link className={linkClass} href="/tours">
                Khám phá tour ngay
              </Link>
            </EmptyRow>
          ) : (
            rows.map((b, i) => {
              const status = getBookingStatusMeta(b.status);
              return (
                <tr key={`${b.type}-${b.id}`}>
                  <td className={td}>{index(i)}</td>
                  <td className={`${td} max-w-72`}>
                    <Field label="Dịch vụ">
                      <span className="text-new-title">{b.title}</span>
                    </Field>
                    <Field label="Loại">{KIND_LABEL[b.type]}</Field>
                    <Field label="Mã đơn">
                      <span className="font-mono text-xs">{b.code}</span>
                    </Field>
                  </td>
                  <td className={`${td} max-w-60`}>
                    <Field label="Tên">{b.providerName}</Field>
                    <Field label="Ngày sử dụng">{formatDate(b.serviceDate)}</Field>
                    <Field label="Số khách">{b.guests}</Field>
                  </td>
                  <td className={td}>
                    <Field label="Tổng tiền">
                      {b.totalAmount === null
                        ? "Thanh toán tại nhà hàng"
                        : formatCurrency(b.totalAmount)}
                    </Field>
                    <p className="mt-1">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </p>
                  </td>
                  <td className={`${td} whitespace-nowrap`}>
                    <Link className={`${linkClass} flex items-center gap-1`} href={bookingHref(b.code)}>
                      <span aria-hidden className="material-symbols-outlined text-lg!">
                        visibility
                      </span>
                      Chi tiết
                    </Link>
                    {hasInvoice(b.code, b.status) && (
                      <Link
                        className={`${linkClass} mt-1 flex items-center gap-1`}
                        href={invoiceHref.customer(b.code)}
                      >
                        <span aria-hidden className="material-symbols-outlined text-lg!">
                          receipt_long
                        </span>
                        Hóa đơn
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Trang ---------- */

export function CustomerDashboard({ data }: { data: CustomerDashboardData }) {
  return (
    <div className="rounded-md bg-new-section-bg p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-semibold text-new-title">Tổng quan</h1>
      <StatCards stats={data.stats} />
      <Section delay={0.1} title="Giao dịch gần đây">
        <TransactionsTable rows={data.transactions} />
      </Section>
      <Section
        action={
          <Link className={`${linkClass} text-sm`} href={MY_BOOKINGS_PATH.tour}>
            Xem tất cả
          </Link>
        }
        delay={0.18}
        title="Đặt chỗ gần đây"
      >
        <BookingsTable rows={data.recentBookings} />
      </Section>
    </div>
  );
}
