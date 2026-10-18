import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTourDuration,
} from "@/lib/utils";
import type { TourBookingDetailView } from "../types";
import { BookingIcon, type BookingIconName } from "./booking-icon";

// Các khối nội dung phong cách Preline cho trang chi tiết đơn đặt tour

/** Thẻ tổng quan đơn đặt tour theo phong cách Preline. */
export function TourBookingDetailHeader({
  booking,
}: {
  booking: TourBookingDetailView;
}) {
  return (
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-5 md:p-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={booking.tourTitle}
        className="aspect-video w-full shrink-0 rounded-lg border border-card-line object-cover sm:aspect-4/3 sm:w-44"
        src={booking.tourImageUrl}
      />
      <div className="flex min-w-0 grow flex-col">
        <h2 className="text-lg font-semibold text-foreground">
          {booking.tourTitle}
        </h2>
        <p className="text-sm text-muted-foreground-1">
          Mã đơn: {booking.code}
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Meta icon="calendar" label="Ngày khởi hành">
            {formatDate(booking.departureDate)}
          </Meta>
          {booking.duration && (
            <Meta icon="clock" label="Thời lượng">
              {formatTourDuration(
                booking.duration.days,
                booking.duration.nights,
              )}
            </Meta>
          )}
          <Meta icon="users" label="Số khách">
            {booking.guests} khách
          </Meta>
          {booking.provinceName && (
            <Meta icon="mapPin" label="Địa điểm">
              {booking.provinceName}
            </Meta>
          )}
        </dl>
      </div>
    </div>
  );
}

function Meta({
  icon,
  label,
  children,
}: {
  icon: BookingIconName;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-x-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface text-surface-foreground">
        <BookingIcon name={icon} />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground-1">{label}</dt>
        <dd className="text-sm font-medium text-foreground">{children}</dd>
      </div>
    </div>
  );
}

const thClass =
  "px-4 py-3 text-xs font-medium text-muted-foreground-1 uppercase md:px-5";
const tdClass = "px-4 py-3 text-sm whitespace-nowrap text-foreground md:px-5";

/** Bảng danh sách khách theo phong cách Preline. */
export function TourBookingGuestsTable({
  booking: b,
}: {
  booking: TourBookingDetailView;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-table-line">
        <thead className="bg-surface">
          <tr>
            <th className={`${thClass} text-start`} scope="col">
              Loại
            </th>
            <th className={`${thClass} text-start`} scope="col">
              Số lượng
            </th>
            <th className={`${thClass} text-end`} scope="col">
              Đơn giá
            </th>
            <th className={`${thClass} text-end`} scope="col">
              Thành tiền
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-table-line">
          <tr>
            <td className={`${tdClass} font-medium`}>Khách tham gia</td>
            <td className={tdClass}>{b.guests}</td>
            <td className={`${tdClass} text-end`}>
              {formatCurrency(b.unitPrice)}
            </td>
            <td className={`${tdClass} text-end font-medium`}>
              {formatCurrency(b.unitPrice * b.guests)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Row({
  label,
  value,
  className = "text-foreground",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-x-6 py-2.5 text-sm">
      <dt className="text-muted-foreground-1">{label}</dt>
      <dd className={`text-end font-medium break-all ${className}`}>{value}</dd>
    </div>
  );
}

export function TourBookingFinancial({
  booking: b,
}: {
  booking: TourBookingDetailView;
}) {
  const ratePct = `${+(b.commissionRate * 100).toFixed(2)}%`;
  return (
    <div className="grid md:grid-cols-2">
      <div className="flex flex-col p-4 md:p-5">
        <dl className="divide-y divide-card-divider">
          <Row
            label={`Đơn giá × ${b.guests} khách`}
            value={`${formatCurrency(b.unitPrice)} × ${b.guests}`}
          />
          <Row label="Tổng thanh toán" value={formatCurrency(b.totalAmount)} />
          <Row
            className="text-red-600"
            label={`Phí dịch vụ (${ratePct})`}
            value={`− ${formatCurrency(b.platformFee)}`}
          />
          {b.refundedAmount > 0 && (
            <Row
              className="text-purple-600"
              label="Đã hoàn tiền"
              value={formatCurrency(b.refundedAmount)}
            />
          )}
        </dl>
        <div className="mt-3 flex items-center justify-between gap-x-4 rounded-lg border border-teal-200 bg-teal-50 p-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-teal-800 uppercase">
              Thực nhận
            </p>
            <p className="text-xs text-teal-700">
              {b.payout?.status === "succeeded"
                ? `Đã chi trả ${formatDateTime(b.payout.paidAt)}`
                : "Chi trả sau khi hoàn thành tour"}
            </p>
          </div>
          <span className="text-xl font-semibold text-teal-800 sm:text-2xl">
            {formatCurrency(b.providerAmount)}
          </span>
        </div>
      </div>

      <div className="flex flex-col border-t border-card-divider p-4 md:border-t-0 md:border-s md:p-5">
        <p className="text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
          Giao dịch
        </p>
        {b.payment ? (
          <dl className="mt-1 divide-y divide-card-divider">
            <Row
              label="Cổng thanh toán"
              value={b.payment.gateway.toUpperCase()}
            />
            <Row
              label="Số tiền thu"
              value={`${b.payment.chargedAmount} ${b.payment.chargedCurrency}`}
            />
            <Row label="Thời gian" value={formatDateTime(b.paidAt)} />
            <Row label="Mã giao dịch" value={b.payment.gatewayOrderId} />
          </dl>
        ) : (
          <div className="mt-3 flex grow flex-col items-center justify-center rounded-lg border border-dashed border-card-line p-6 text-center">
            <BookingIcon
              name="creditCard"
              className="size-6 text-muted-foreground-1"
            />
            <p className="mt-2 text-sm text-muted-foreground-1">
              Chưa có giao dịch nào.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
