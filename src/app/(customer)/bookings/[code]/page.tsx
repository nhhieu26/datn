import { hotelBookingRepo } from "@/entities/hotel-booking";
import { tourBookingRepo } from "@/entities/tour-booking";
import {
  BookingStepper,
  CompleteStep,
  hotelBookingSummary,
  PendingPayment,
  tourBookingSummary,
} from "@/features/customer/booking";
import {
  CODE_PREFIX,
  REBOOK_LABEL,
  stepLabels,
} from "@/features/customer/booking/lib/booking-labels";
import { USD_RATE } from "@/features/customer/booking/lib/exchange-rate";
import { PageBanner } from "@/features/customer/components/page-banner";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = { title: "Đơn đặt chỗ — Roamly" };

type Props = { params: Promise<{ code: string }> };

const PAID_STATUSES = new Set(["paid", "confirmed", "completed"]);

/** Tải booking theo tiền tố mã (HB- → khách sạn, còn lại → tour) và build summary. */
async function loadBooking(code: string, customerId: string) {
  if (code.startsWith(`${CODE_PREFIX.hotel}-`)) {
    await hotelBookingRepo.releaseExpired();
    const booking = await hotelBookingRepo.findByCodeForCustomer(code, customerId);
    return booking && { booking, summary: hotelBookingSummary(booking) };
  }
  await tourBookingRepo.releaseExpired();
  const booking = await tourBookingRepo.findByCodeForCustomer(code, customerId);
  return booking && { booking, summary: tourBookingSummary(booking) };
}

export default async function BookingResultPage({ params }: Props) {
  const { code } = await params;
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const loaded = await loadBooking(decodeURIComponent(code), session.user.id);
  if (!loaded) notFound();

  const { booking, summary } = loaded;
  const paid = PAID_STATUSES.has(booking.status);
  const lastPayment = booking.payments[0];

  let content: React.ReactNode;
  if (paid) {
    content = (
      <CompleteStep
        code={booking.code}
        contact={{
          contactName: booking.contactName,
          contactEmail: booking.contactEmail,
          contactPhone: booking.contactPhone,
          note: booking.note ?? "",
        }}
        summary={summary}
      />
    );
  } else if (
    booking.status === "pending_payment" &&
    lastPayment?.status === "processing"
  ) {
    content = (
      <div className="mx-auto max-w-xl rounded-lg bg-new-chip p-8 text-center">
        <span aria-hidden className="material-symbols-outlined text-5xl text-new-teal">
          hourglass_top
        </span>
        <h3 className="mt-3 text-2xl font-bold text-new-title">
          Đang xác nhận thanh toán
        </h3>
        <p className="mt-2 text-new-paragraph">
          Chúng tôi chưa nhận được kết quả cuối cùng từ PayPal cho đơn{" "}
          {booking.code}. Chỗ của bạn vẫn được giữ. Vui lòng không thanh toán
          lại — bấm kiểm tra để cập nhật.
        </p>
        <a
          className="mt-6 inline-block rounded bg-new-teal px-7 py-3.5 font-bold text-white transition-colors hover:bg-new-teal-hover"
          href={`/api/paypal/orders/return?token=${encodeURIComponent(lastPayment.gatewayOrderId)}`}
        >
          Kiểm tra lại
        </a>
      </div>
    );
  } else if (booking.status === "pending_payment" && booking.expiresAt) {
    content = (
      <PendingPayment
        code={booking.code}
        expiresAt={booking.expiresAt.toISOString()}
        failureReason={
          lastPayment?.status === "failed"
            ? `Thanh toán chưa thành công: ${lastPayment.failureReason ?? "lỗi không xác định"}.`
            : undefined
        }
        summary={summary}
        usdRate={USD_RATE}
      />
    );
  } else {
    content = (
      <div className="mx-auto max-w-xl rounded-lg bg-new-chip p-8 text-center">
        <span aria-hidden className="material-symbols-outlined text-5xl text-new-coral">
          timer_off
        </span>
        <h3 className="mt-3 text-2xl font-bold text-new-title">
          {booking.status === "expired"
            ? "Đơn đã hết thời gian giữ chỗ"
            : "Đơn đã bị hủy"}
        </h3>
        <p className="mt-2 text-new-paragraph">
          Đơn {booking.code} không còn hiệu lực
          {booking.status === "expired" && " và chưa bị trừ tiền"}. Bạn có thể
          đặt lại nếu vẫn còn {summary.kind === "hotel" ? "phòng" : "chỗ"}.
        </p>
        <Link
          className="mt-6 inline-block rounded bg-new-teal px-7 py-3.5 font-bold text-white transition-colors hover:bg-new-teal-hover"
          href={summary.backHref}
        >
          {REBOOK_LABEL[summary.kind]}
        </Link>
      </div>
    );
  }

  const steps = stepLabels(summary.kind);
  return (
    <main>
      <PageBanner
        items={[
          { label: "Trang chủ", href: "/" },
          { label: summary.name, href: summary.backHref },
          { label: `Đơn ${booking.code}` },
        ]}
        title={paid ? "Đặt chỗ thành công" : "Thanh toán đặt chỗ"}
      >
        <BookingStepper current={paid ? steps.length - 1 : 1} steps={steps} />
      </PageBanner>
      <section className="page-x py-12">{content}</section>
    </main>
  );
}
