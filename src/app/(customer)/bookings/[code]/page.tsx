import { hotelBookingRepo } from "@/entities/hotel-booking";
import { restaurantBookingRepo } from "@/entities/restaurant-booking";
import { tourBookingRepo } from "@/entities/tour-booking";
import {
  BookingStepper,
  CompleteStep,
  hotelBookingSummary,
  PendingPayment,
  restaurantBookingSummary,
  tourBookingSummary,
  type BookingSummary,
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

function ResultLayout({
  summary,
  code,
  title,
  done,
  children,
}: {
  summary: BookingSummary;
  code: string;
  title: string;
  done: boolean;
  children: React.ReactNode;
}) {
  const steps = stepLabels(summary.kind);
  return (
    <main>
      <PageBanner
        items={[
          { label: "Trang chủ", href: "/" },
          { label: summary.name, href: summary.backHref },
          { label: `Đơn ${code}` },
        ]}
        title={title}
      >
        <BookingStepper current={done ? steps.length - 1 : 1} steps={steps} />
      </PageBanner>
      <section className="page-x py-12">{children}</section>
    </main>
  );
}

function InactiveBooking({
  summary,
  code,
  expired,
}: {
  summary: BookingSummary;
  code: string;
  expired: boolean;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-lg bg-new-chip p-8 text-center">
      <span aria-hidden className="material-symbols-outlined text-5xl text-new-coral">
        timer_off
      </span>
      <h3 className="mt-3 text-2xl font-bold text-new-title">
        {expired ? "Đơn đã hết thời gian giữ chỗ" : "Đơn đã bị hủy"}
      </h3>
      <p className="mt-2 text-new-paragraph">
        Đơn {code} không còn hiệu lực
        {expired && " và chưa bị trừ tiền"}. Bạn có thể đặt lại nếu vẫn còn{" "}
        {summary.kind === "hotel" ? "phòng" : "chỗ"}.
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

/** Đơn đặt bàn không có thanh toán: confirmed/completed → hoàn tất, còn lại → đã hủy. */
async function RestaurantBookingResult({
  code,
  customerId,
}: {
  code: string;
  customerId: string;
}) {
  const booking = await restaurantBookingRepo.findByCodeForCustomer(code, customerId);
  if (!booking) notFound();
  const summary = restaurantBookingSummary(booking);
  const active = booking.status === "confirmed" || booking.status === "completed";

  return (
    <ResultLayout
      code={booking.code}
      done={active}
      summary={summary}
      title={active ? "Đặt bàn thành công" : "Đơn đặt bàn"}
    >
      {active ? (
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
      ) : (
        <InactiveBooking code={booking.code} expired={false} summary={summary} />
      )}
    </ResultLayout>
  );
}

export default async function BookingResultPage({ params }: Props) {
  const { code } = await params;
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const decoded = decodeURIComponent(code);
  if (decoded.startsWith(`${CODE_PREFIX.restaurant}-`)) {
    return <RestaurantBookingResult code={decoded} customerId={session.user.id} />;
  }

  const loaded = await loadBooking(decoded, session.user.id);
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
      <InactiveBooking
        code={booking.code}
        expired={booking.status === "expired"}
        summary={summary}
      />
    );
  }

  return (
    <ResultLayout
      code={booking.code}
      done={paid}
      summary={summary}
      title={paid ? "Đặt chỗ thành công" : "Thanh toán đặt chỗ"}
    >
      {content}
    </ResultLayout>
  );
}
