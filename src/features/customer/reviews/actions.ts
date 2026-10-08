"use server";

import { revalidatePath } from "next/cache";
import { createReviewSchema, reviewRepo } from "@/entities/review";
import { auth } from "@/lib/auth";
import { fromZodError, runAction } from "@/shared/lib/action-state";
import { UnauthenticatedError, ValidationError } from "@/shared/lib/errors";
import { MY_BOOKINGS_PATH, SERVICE_PATH } from "./paths";

/** Customer đánh giá một đơn đã hoàn thành. */
export async function createReviewAction(input: unknown) {
  return runAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "customer") {
      throw new UnauthenticatedError("Vui lòng đăng nhập tài khoản khách hàng.");
    }
    const parsed = createReviewSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));

    const { slug } = await reviewRepo.create(session.user.id, parsed.data);

    const { kind } = parsed.data;
    revalidatePath(`${SERVICE_PATH[kind]}/${slug}`);
    revalidatePath(MY_BOOKINGS_PATH[kind]);
    revalidatePath("/explore");
    revalidatePath("/");
  });
}
