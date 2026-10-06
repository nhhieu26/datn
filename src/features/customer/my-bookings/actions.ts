"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hotelBookingRepo } from "@/entities/hotel-booking";
import { tourBookingRepo } from "@/entities/tour-booking";
import { auth } from "@/lib/auth";
import {
  refundCapture,
  settleTransfer,
  type TransferStatus,
} from "@/lib/paypal";
import { fromZodError, runAction } from "@/shared/lib/action-state";
import { UnauthenticatedError, ValidationError } from "@/shared/lib/errors";

const cancelSchema = z.object({
  code: z.string().min(1),
  reason: z
    .string()
    .trim()
    .min(5, "Lý do hủy cần ít nhất 5 ký tự.")
    .max(500, "Lý do hủy tối đa 500 ký tự."),
});

type CancelForCustomer =
  | typeof tourBookingRepo.cancelForCustomer
  | typeof hotelBookingRepo.cancelForCustomer;

/** Customer hủy đơn paid/confirmed; sàn hoàn toàn bộ tiền qua PayPal. */
function cancelMyBooking(
  input: unknown,
  cancelForCustomer: CancelForCustomer,
  revalidate: (code: string) => void,
) {
  return runAction<{ moneyStatus: TransferStatus }>(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "customer") {
      throw new UnauthenticatedError("Vui lòng đăng nhập tài khoản khách hàng.");
    }
    const parsed = cancelSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));
    const { code, reason } = parsed.data;

    const { booking, refund, captureId } = await cancelForCustomer(
      code,
      session.user.id,
      reason,
    );
    // Refund cập nhật theo id, dùng chung cho tour và khách sạn
    const moneyStatus = await settleTransfer(
      `refund ${booking.code}`,
      () =>
        refundCapture({
          captureId,
          amountUsd: refund.chargedAmount.toFixed(2),
          refundId: refund.id,
          note: `Khách hủy đơn ${booking.code}: ${reason}`,
        }),
      (result) => tourBookingRepo.markRefundResult(refund.id, result),
    );

    revalidatePath(`/bookings/${code}`);
    revalidate(code);
    return { moneyStatus };
  });
}

export async function cancelMyTourBookingAction(input: unknown) {
  return cancelMyBooking(input, tourBookingRepo.cancelForCustomer, (code) => {
    revalidatePath("/my-bookings");
    revalidatePath("/provider/bookings/tours");
    revalidatePath(`/provider/bookings/tours/${code}`);
  });
}

export async function cancelMyHotelBookingAction(input: unknown) {
  return cancelMyBooking(input, hotelBookingRepo.cancelForCustomer, (code) => {
    revalidatePath("/my-hotel-bookings");
    revalidatePath("/provider/bookings/hotels");
    revalidatePath(`/provider/bookings/hotels/${code}`);
  });
}
