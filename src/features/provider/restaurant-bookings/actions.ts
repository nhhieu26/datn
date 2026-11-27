"use server";

import { revalidatePath } from "next/cache";
import { notifyProviderUpdatedBooking } from "@/entities/notification";
import { providerProfileRepo } from "@/entities/provider-profile";
import { restaurantBookingRepo } from "@/entities/restaurant-booking";
import { auth } from "@/lib/auth";
import type { TransferStatus } from "@/lib/paypal";
import { fromZodError, runAction } from "@/shared/lib/action-state";
import {
  ForbiddenError,
  UnauthenticatedError,
  ValidationError,
} from "@/shared/lib/errors";
import { updateRestaurantBookingStatusSchema } from "./schema";

async function requireRestaurantProviderId() {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthenticatedError();
  const profile = await providerProfileRepo.findApprovedByUserIdAndBusinessType(
    session.user.id,
    "restaurant",
  );
  if (!profile) throw new ForbiddenError();
  return profile.id;
}

// Đặt bàn không thanh toán nên không có moneyStatus; giữ cùng kiểu kết quả với tour / khách sạn
export async function updateRestaurantBookingStatusAction(input: unknown) {
  return runAction<{ moneyStatus?: TransferStatus }>(async () => {
    const providerProfileId = await requireRestaurantProviderId();
    const parsed = updateRestaurantBookingStatusSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));
    const data = parsed.data;

    if (data.status === "confirmed") {
      await restaurantBookingRepo.confirmForProvider(data.code, providerProfileId);
      await notifyProviderUpdatedBooking({
        kind: "restaurant",
        code: data.code,
        status: "confirmed",
      });
    } else if (data.status === "completed") {
      await restaurantBookingRepo.completeForProvider(data.code, providerProfileId);
      await notifyProviderUpdatedBooking({
        kind: "restaurant",
        code: data.code,
        status: "completed",
      });
    } else {
      await restaurantBookingRepo.cancelForProvider(
        data.code,
        providerProfileId,
        data.reason,
      );
      await notifyProviderUpdatedBooking({
        kind: "restaurant",
        code: data.code,
        status: "cancelled",
        reason: data.reason,
      });
    }

    revalidatePath("/provider/bookings/restaurants");
    revalidatePath(`/provider/bookings/restaurants/${data.code}`);
    revalidatePath("/my-restaurant-bookings");
    revalidatePath(`/bookings/${data.code}`);
    return {};
  });
}
