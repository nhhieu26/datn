"use server";

import { revalidatePath } from "next/cache";
import { notifyReviewCreated } from "@/entities/notification";
import { reviewRepo } from "@/entities/review";
import { MY_BOOKINGS_PATH, SERVICE_PATH } from "@/features/customer/reviews/paths";
import { logModeration } from "@/lib/moderation";
import { runAction, type ActionState } from "@/shared/lib/action-state";
import { requireAdmin } from "@/shared/lib/require-admin";
import { ValidationError } from "@/shared/lib/errors";
import { MODERATION_PATH } from "./search-params";

/** Admin duyệt / ẩn một review; điểm trung bình của dịch vụ được tính lại. */
export async function setReviewStatusAction(
  reviewId: string,
  status: "approved" | "rejected",
): Promise<ActionState> {
  return runAction<undefined>(async () => {
    const session = await requireAdmin();
    if (status !== "approved" && status !== "rejected") {
      throw new ValidationError({ status: ["Trạng thái không hợp lệ."] });
    }

    const { previousStatus, item, slug } = await reviewRepo.setStatus(reviewId, status);
    await logModeration({
      target: "review",
      targetId: reviewId,
      userId: session.user.id,
      content: item.content,
      stage: "admin",
      verdict: status === "approved" ? "approve" : "reject",
    });

    // Review lần đầu được hiển thị → báo provider như một đánh giá mới
    if (status === "approved" && previousStatus !== "approved" && item.bookingCode) {
      await notifyReviewCreated({ kind: item.kind, bookingCode: item.bookingCode, rating: item.rating });
    }

    if (slug) revalidatePath(`${SERVICE_PATH[item.kind]}/${slug}`);
    revalidatePath(MY_BOOKINGS_PATH[item.kind]);
    revalidatePath(MODERATION_PATH);
    revalidatePath("/explore");
    revalidatePath("/");
    return undefined;
  });
}
