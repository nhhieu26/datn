import type { Prisma } from "@/generated/prisma/client";
import { hotelBookingRepo } from "@/entities/hotel-booking";
import { tourBookingRepo } from "@/entities/tour-booking";
import { auth } from "@/lib/auth";
import { captureOrder } from "@/lib/paypal";
import { NextResponse, type NextRequest } from "next/server";

/** Tìm payment theo order id cùng booking (tour hoặc khách sạn) và repo xử lý tương ứng. */
async function findPayment(orderId: string) {
  const tourPayment = await tourBookingRepo.findPaymentByOrderId(orderId);
  if (tourPayment?.tourBooking) {
    return { payment: tourPayment, booking: tourPayment.tourBooking, repo: tourBookingRepo };
  }
  const hotelPayment = await hotelBookingRepo.findPaymentByOrderId(orderId);
  if (hotelPayment?.hotelBooking) {
    return { payment: hotelPayment, booking: hotelPayment.hotelBooking, repo: hotelBookingRepo };
  }
  return null;
}

// PayPal redirect về đây sau khi customer approve: ?token=<orderId>&PayerID=...
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const orderId = request.nextUrl.searchParams.get("token");
  const found = orderId ? await findPayment(orderId) : null;
  if (!found || found.booking.customerId !== session.user.id) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  const { payment, booking, repo } = found;
  const done = () =>
    NextResponse.redirect(new URL(`/bookings/${booking.code}`, request.url));

  if (payment.status === "pending") {
    const held = await repo.markPaymentProcessing(payment.id, booking.id);
    if (!held) {
      await repo.markPaymentFailed(
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
      await repo.markPaid({
        paymentId: payment.id,
        bookingId: booking.id,
        captureId: result.captureId,
        raw: result.raw as Prisma.InputJsonValue,
      });
    } else {
      await repo.markPaymentFailed(
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
