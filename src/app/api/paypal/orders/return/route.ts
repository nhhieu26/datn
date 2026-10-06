import type { Prisma } from "@/generated/prisma/client";
import { tourBookingRepo } from "@/entities/tour-booking";
import { auth } from "@/lib/auth";
import { captureOrder } from "@/lib/paypal";
import { NextResponse, type NextRequest } from "next/server";

// PayPal redirect về đây sau khi customer approve: ?token=<orderId>&PayerID=...
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const orderId = request.nextUrl.searchParams.get("token");
  const payment = orderId
    ? await tourBookingRepo.findPaymentByOrderId(orderId)
    : null;
  const booking = payment?.tourBooking;
  if (!payment || !booking || booking.customerId !== session.user.id) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  const done = () =>
    NextResponse.redirect(new URL(`/bookings/${booking.code}`, request.url));

  if (payment.status === "pending") {
    const held = await tourBookingRepo.markPaymentProcessing(payment.id, booking.id);
    if (!held) {
      await tourBookingRepo.markPaymentFailed(
        payment.id,
        "Hết thời gian giữ chỗ trước khi thanh toán hoàn tất"
      );
      return done();
    }
  } else if (payment.status !== "processing") {
    // Đã có kết quả (reload trang) → chỉ hiển thị
    return done();
  }

  // Payment `processing`: chạy lần đầu, hoặc thử lại sau lỗi mạng/DB. Capture idempotent
  // (PayPal-Request-Id) nên gọi lại an toàn. Chỉ đánh failed khi PayPal trả lời rõ ràng;
  // còn lại giữ processing để booking không bị nhả chỗ trong khi tiền có thể đã bị trừ.
  try {
    const result = await captureOrder(payment.gatewayOrderId);
    if (result.completed) {
      await tourBookingRepo.markPaid({
        paymentId: payment.id,
        bookingId: booking.id,
        captureId: result.captureId,
        raw: result.raw as Prisma.InputJsonValue,
      });
    } else {
      await tourBookingRepo.markPaymentFailed(
        payment.id,
        "PayPal từ chối giao dịch",
        result.raw as Prisma.InputJsonValue
      );
    }
  } catch (error) {
    console.error("[paypal] capture/record failed, payment kept processing", error);
  }
  return done();
}
