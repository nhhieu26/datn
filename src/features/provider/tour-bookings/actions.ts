"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { providerProfileRepo } from "@/entities/provider-profile";
import { tourBookingRepo } from "@/entities/tour-booking";
import { auth } from "@/lib/auth";
import {
  createPayout,
  refundCapture,
  type TransferResult,
  type TransferStatus,
} from "@/lib/paypal";
import { fromZodError, runAction } from "@/shared/lib/action-state";
import {
  ForbiddenError,
  UnauthenticatedError,
  ValidationError,
} from "@/shared/lib/errors";

const updateStatusSchema = z.discriminatedUnion("status", [
  z.object({ code: z.string().min(1), status: z.literal("confirmed") }),
  z.object({ code: z.string().min(1), status: z.literal("completed") }),
  z.object({
    code: z.string().min(1),
    status: z.literal("cancelled"),
    reason: z
      .string()
      .trim()
      .min(5, "Lý do hủy cần ít nhất 5 ký tự.")
      .max(500, "Lý do hủy tối đa 500 ký tự."),
  }),
]);

async function requireTourProviderId() {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthenticatedError();
  const profile = await providerProfileRepo.findApprovedByUserIdAndBusinessType(
    session.user.id,
    "tour",
  );
  if (!profile) throw new ForbiddenError();
  return profile.id;
}

/**
 * Gọi PayPal sau khi DB đã commit. Lỗi chưa rõ kết quả (mạng, 5xx) giữ `processing`;
 * kết quả cuối được cập nhật qua webhook.
 */
async function settle(
  label: string,
  transfer: () => Promise<TransferResult>,
  save: (result: TransferResult) => Promise<unknown>,
): Promise<TransferStatus> {
  try {
    const result = await transfer();
    await save(result);
    return result.status;
  } catch (error) {
    console.error(`[paypal] ${label} failed`, error);
    return "processing";
  }
}

export async function updateTourBookingStatusAction(input: unknown) {
  return runAction<{ moneyStatus?: TransferStatus }>(async () => {
    const providerProfileId = await requireTourProviderId();
    const parsed = updateStatusSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));
    const data = parsed.data;

    let moneyStatus: TransferStatus | undefined;
    if (data.status === "confirmed") {
      await tourBookingRepo.confirmForProvider(data.code, providerProfileId);
    } else if (data.status === "cancelled") {
      const { booking, refund, captureId } =
        await tourBookingRepo.cancelForProvider(
          data.code,
          providerProfileId,
          data.reason,
        );
      moneyStatus = await settle(
        `refund ${booking.code}`,
        () =>
          refundCapture({
            captureId,
            amountUsd: refund.chargedAmount.toFixed(2),
            refundId: refund.id,
            note: `Hoàn tiền đơn ${booking.code}: ${data.reason}`,
          }),
        (result) => tourBookingRepo.markRefundResult(refund.id, result),
      );
    } else {
      const { booking, payout, recipientType } =
        await tourBookingRepo.completeForProvider(data.code, providerProfileId);
      moneyStatus = await settle(
        `payout ${booking.code}`,
        () =>
          createPayout({
            payoutId: payout.id,
            amountUsd: payout.chargedAmount.toFixed(2),
            receiver: payout.receiver,
            recipientType,
            note: `Thanh toán đơn ${booking.code} - ${booking.tourTitle}`,
          }),
        (result) => tourBookingRepo.markPayoutResult(payout.id, result),
      );
    }

    revalidatePath("/provider/bookings/tours");
    revalidatePath(`/provider/bookings/tours/${data.code}`);
    return { moneyStatus };
  });
}
