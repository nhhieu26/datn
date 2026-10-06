"use server";

import { revalidatePath } from "next/cache";
import { hotelBookingRepo } from "@/entities/hotel-booking";
import { providerProfileRepo } from "@/entities/provider-profile";
import { tourBookingRepo } from "@/entities/tour-booking";
import { updateBookingStatusSchema } from "@/features/provider/tour-bookings/schema";
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

async function requireHotelProviderId() {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthenticatedError();
  const profile = await providerProfileRepo.findApprovedByUserIdAndBusinessType(
    session.user.id,
    "hotel",
  );
  if (!profile) throw new ForbiddenError();
  return profile.id;
}

export async function updateHotelBookingStatusAction(input: unknown) {
  return runAction<{ moneyStatus?: TransferStatus }>(async () => {
    const providerProfileId = await requireHotelProviderId();
    const parsed = updateBookingStatusSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));
    const data = parsed.data;

    // Refund / Payout cập nhật theo id, dùng chung với tour booking
    let moneyStatus: TransferStatus | undefined;
    if (data.status === "confirmed") {
      await hotelBookingRepo.confirmForProvider(data.code, providerProfileId);
    } else if (data.status === "cancelled") {
      const { booking, refund, captureId } =
        await hotelBookingRepo.cancelForProvider(
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
    } else {
      const { booking, payout, recipientType } =
        await hotelBookingRepo.completeForProvider(data.code, providerProfileId);
      moneyStatus = await settleTransfer(
        `payout ${booking.code}`,
        () =>
          createPayout({
            payoutId: payout.id,
            amountUsd: payout.chargedAmount.toFixed(2),
            receiver: payout.receiver,
            recipientType,
            note: `Thanh toán đơn ${booking.code} - ${booking.hotelName}`,
          }),
        (result) => tourBookingRepo.markPayoutResult(payout.id, result),
      );
    }

    revalidatePath("/provider/bookings/hotels");
    revalidatePath(`/provider/bookings/hotels/${data.code}`);
    return { moneyStatus };
  });
}
