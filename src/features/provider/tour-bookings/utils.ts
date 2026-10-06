import type { TourBookingWithPayment } from "@/entities/tour-booking";
import type { BookingStatus } from "@/generated/prisma/enums";
import type {
  PaymentState,
  TourBookingListItem,
  TourBookingsSummary,
} from "./types";

type StatusMeta = {
  label: string;
  icon: string;
  className: string;
  filled?: boolean;
};

const statusMeta: Record<BookingStatus, StatusMeta> = {
  pending_payment: {
    label: "Chờ thanh toán",
    icon: "schedule",
    className: "border-amber-200/80 bg-amber-50 text-amber-700",
  },
  paid: {
    label: "Đã thanh toán",
    icon: "payments",
    className: "border-sky-200/80 bg-sky-50 text-sky-700",
    filled: true,
  },
  confirmed: {
    label: "Đã xác nhận",
    icon: "check_circle",
    className: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
    filled: true,
  },
  completed: {
    label: "Hoàn thành",
    icon: "task_alt",
    className: "border-slate-200/80 bg-slate-100 text-slate-700",
    filled: true,
  },
  cancelled: {
    label: "Đã hủy",
    icon: "cancel",
    className: "border-rose-200/80 bg-rose-50 text-rose-700",
  },
  expired: {
    label: "Hết hạn giữ chỗ",
    icon: "timer_off",
    className: "border-slate-200/80 bg-slate-50 text-slate-500",
  },
  no_show: {
    label: "Vắng mặt",
    icon: "person_off",
    className: "border-rose-200/80 bg-rose-50 text-rose-700",
  },
};

export function getBookingStatusMeta(status: BookingStatus): StatusMeta {
  return statusMeta[status];
}

export const BOOKING_STATUS_OPTIONS = (
  Object.keys(statusMeta) as BookingStatus[]
).map((value) => ({ value, label: statusMeta[value].label }));

const paymentMeta: Record<PaymentState, StatusMeta> = {
  unpaid: {
    label: "Chưa thanh toán",
    icon: "hourglass_empty",
    className: "border-slate-200/80 bg-slate-50 text-slate-600",
  },
  processing: {
    label: "Đang xử lý",
    icon: "sync",
    className: "border-sky-200/80 bg-sky-50 text-sky-700",
  },
  paid: {
    label: "Đã thanh toán",
    icon: "check_circle",
    className: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
    filled: true,
  },
  failed: {
    label: "Thất bại",
    icon: "error",
    className: "border-rose-200/80 bg-rose-50 text-rose-700",
  },
  refunded: {
    label: "Đã hoàn tiền",
    icon: "undo",
    className: "border-violet-200/80 bg-violet-50 text-violet-700",
  },
};

export function getPaymentMeta(state: PaymentState): StatusMeta {
  return paymentMeta[state];
}

function getPaymentState(booking: TourBookingWithPayment): PaymentState {
  const { payments, refunds } = booking;
  if (payments.some((p) => p.status === "succeeded")) {
    return refunds.some((r) => r.status === "succeeded") ? "refunded" : "paid";
  }
  const latest = payments[0]?.status;
  if (latest === "processing") return "processing";
  if (latest === "failed") return "failed";
  return "unpaid";
}

const FALLBACK_IMAGE = "/image-notfound.png";

function extractTourImageUrl(booking: TourBookingWithPayment): string {
  const images = booking.tourDeparture?.tour.images;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0] as { url?: unknown };
    if (typeof first?.url === "string") return first.url;
  }
  return FALLBACK_IMAGE;
}

export function mapTourBookingToListItem(
  booking: TourBookingWithPayment,
): TourBookingListItem {
  return {
    id: booking.id,
    code: booking.code,
    tourTitle: booking.tourTitle,
    tourImageUrl: extractTourImageUrl(booking),
    customerName: booking.contactName,
    customerPhone: booking.contactPhone,
    customerEmail: booking.contactEmail,
    guests: booking.guests,
    totalAmount: Number(booking.totalAmount),
    providerAmount: Number(booking.providerAmount),
    paymentState: getPaymentState(booking),
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
  };
}

export function getTourBookingsSummary(
  rows: {
    status: BookingStatus;
    _count: { _all: number };
    _sum: { providerAmount: { toNumber(): number } | null };
  }[],
): TourBookingsSummary {
  const revenueStatuses: BookingStatus[] = ["paid", "confirmed", "completed"];
  const countOf = (statuses: BookingStatus[]) =>
    rows
      .filter((row) => statuses.includes(row.status))
      .reduce((sum, row) => sum + row._count._all, 0);
  return {
    total: rows.reduce((sum, row) => sum + row._count._all, 0),
    awaitingPayment: countOf(["pending_payment"]),
    confirmed: countOf(["paid", "confirmed"]),
    revenue: rows
      .filter((row) => revenueStatuses.includes(row.status))
      .reduce((sum, row) => sum + (row._sum.providerAmount?.toNumber() ?? 0), 0),
  };
}
