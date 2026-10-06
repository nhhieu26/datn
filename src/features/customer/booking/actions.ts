"use server";

import { headers } from "next/headers";
import {
  createTourBookingSchema,
  tourBookingRepo,
} from "@/entities/tour-booking";
import { auth } from "@/lib/auth";
import { createOrder } from "@/lib/paypal";
import { fromZodError, runAction } from "@/shared/lib/action-state";
import {
  ConflictError,
  NotFoundError,
  UnauthenticatedError,
  ValidationError,
} from "@/shared/lib/errors";
import { USD_RATE } from "./lib/exchange-rate";

async function requireCustomerId() {
  const session = await auth();
  if (!session?.user || session.user.role !== "customer") {
    throw new UnauthenticatedError("Vui lòng đăng nhập tài khoản khách hàng.");
  }
  return session.user.id;
}

async function appOrigin() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

/** Bước "Tiếp tục": tạo booking pending_payment và giữ chỗ. */
export async function createTourBookingAction(input: unknown) {
  return runAction(async () => {
    const customerId = await requireCustomerId();
    const parsed = createTourBookingSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));
    const booking = await tourBookingRepo.createHeld(customerId, parsed.data);
    return { code: booking.code, expiresAt: booking.expiresAt!.toISOString() };
  });
}

/** Tạo PayPal order cho booking đang giữ chỗ, trả link approve để redirect. */
export async function startTourPaymentAction(code: string) {
  return runAction(async () => {
    const customerId = await requireCustomerId();
    const booking = await tourBookingRepo.findByCodeForCustomer(
      String(code),
      customerId
    );
    if (!booking) throw new NotFoundError("Không tìm thấy đơn đặt tour.");
    if (
      booking.status !== "pending_payment" ||
      !booking.expiresAt ||
      booking.expiresAt <= new Date()
    ) {
      throw new ConflictError("Đơn đã hết thời gian giữ chỗ hoặc đã thanh toán.");
    }
    if (booking.payments.some((p) => p.status === "processing")) {
      throw new ConflictError("Thanh toán trước đó đang được xác nhận, vui lòng đợi.");
    }

    const origin = await appOrigin();
    const amountUsd = booking.totalAmount.div(USD_RATE).toFixed(2);
    const order = await createOrder({
      amountUsd,
      referenceId: booking.id,
      description: `${booking.code} - ${booking.tourTitle}`,
      returnUrl: `${origin}/api/paypal/orders/return`,
      cancelUrl: `${origin}/bookings/${booking.code}`,
    });
    await tourBookingRepo.createPayment({
      tourBookingId: booking.id,
      amount: booking.totalAmount,
      chargedAmount: amountUsd,
      exchangeRate: USD_RATE,
      gatewayOrderId: order.id,
    });
    return { approveUrl: order.approveUrl };
  });
}
