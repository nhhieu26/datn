"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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

/** Customer hủy đơn paid/confirmed; sàn hoàn toàn bộ tiền qua PayPal. */
export async function cancelMyTourBookingAction(input: unknown) {
  return runAction<{ moneyStatus: TransferStatus }>(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "customer") {
      throw new UnauthenticatedError("Vui lòng đăng nhập tài khoản khách hàng.");
    }
    const parsed = cancelSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));
    const { code, reason } = parsed.data;

    const { booking, refund, captureId } =
      await tourBookingRepo.cancelForCustomer(code, session.user.id, reason);
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

    revalidatePath("/my-bookings");
    revalidatePath(`/bookings/${code}`);
    revalidatePath("/provider/bookings/tours");
    revalidatePath(`/provider/bookings/tours/${code}`);
    return { moneyStatus };
  });
}
