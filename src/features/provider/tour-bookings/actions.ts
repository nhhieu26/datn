"use server";

import { revalidatePath } from "next/cache";
import {
  notifyProviderUpdatedBooking,
  notifyTransferFailed,
} from "@/entities/notification";
import { providerProfileRepo } from "@/entities/provider-profile";
import { tourBookingRepo } from "@/entities/tour-booking";
import { auth } from "@/lib/auth";
import {
  createPayout,
  refundCapture,
  settleTransfer,
  type TransferStatus,
} from "@/lib/paypal";
import { fromZodError, runAction } from "@/shared/lib/action-state";
import {
  ForbiddenError,
  UnauthenticatedError,
  ValidationError,
} from "@/shared/lib/errors";
import { updateBookingStatusSchema } from "./schema";

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

export async function updateTourBookingStatusAction(input: unknown) {
  return runAction<{ moneyStatus?: TransferStatus }>(async () => {
    const providerProfileId = await requireTourProviderId();
    const parsed = updateBookingStatusSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));
    const data = parsed.data;

    let moneyStatus: TransferStatus | undefined;
    if (data.status === "confirmed") {
      await tourBookingRepo.confirmForProvider(data.code, providerProfileId);
      await notifyProviderUpdatedBooking({
        kind: "tour",
        code: data.code,
        status: "confirmed",
      });
    } else if (data.status === "cancelled") {
      const { booking, refund, captureId } =
        await tourBookingRepo.cancelForProvider(
          data.code,
          providerProfileId,
          data.reason,
        );
      moneyStatus = await settleTransfer(
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
      await notifyProviderUpdatedBooking({
        kind: "tour",
        code: booking.code,
        status: "cancelled",
        reason: data.reason,
      });
      if (moneyStatus === "failed") {
        await notifyTransferFailed({
          transferType: "refund",
          kind: "tour",
          bookingCode: booking.code,
        });
      }
    } else {
      const { booking, payout, recipientType } =
        await tourBookingRepo.completeForProvider(data.code, providerProfileId);
      moneyStatus = await settleTransfer(
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
      await notifyProviderUpdatedBooking({
        kind: "tour",
        code: booking.code,
        status: "completed",
      });
      if (moneyStatus === "failed") {
        await notifyTransferFailed({
          transferType: "payout",
          kind: "tour",
          bookingCode: booking.code,
        });
      }
    }

    revalidatePath("/provider/bookings/tours");
    revalidatePath(`/provider/bookings/tours/${data.code}`);
    return { moneyStatus };
  });
}
