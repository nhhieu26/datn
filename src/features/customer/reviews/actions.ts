"use server";

import { revalidatePath } from "next/cache";
import { notifyContentFlagged, notifyReviewCreated } from "@/entities/notification";
import { createReviewSchema, reviewRepo, type ReviewModerationStatus } from "@/entities/review";
import { auth } from "@/lib/auth";
import { attachModerationLogs, moderateContent } from "@/lib/moderation";
import { fromZodError, runAction } from "@/shared/lib/action-state";
import { UnauthenticatedError, ValidationError } from "@/shared/lib/errors";
import { MY_BOOKINGS_PATH, SERVICE_PATH } from "./paths";

/**
 * Customer đánh giá một đơn đã hoàn thành.
 * Nội dung qua kiểm duyệt 2 tầng (từ khóa → AI) trước khi lưu; chỉ review được duyệt mới hiển thị.
 */
export async function createReviewAction(input: unknown) {
  return runAction<{ status: ReviewModerationStatus }>(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "customer") {
      throw new UnauthenticatedError("Vui lòng đăng nhập tài khoản khách hàng.");
    }
    const parsed = createReviewSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));
    const { kind, bookingCode, rating, content } = parsed.data;

    const serviceName = await reviewRepo.findServiceNameForBooking(kind, bookingCode, session.user.id);
    const decision = await moderateContent({
      target: "review",
      userId: session.user.id,
      content,
      subject: serviceName ?? undefined,
      rating,
    });
    if (decision.action === "block") {
      throw new ValidationError({ content: [decision.reason] });
    }

    const { slug, reviewId } = await reviewRepo.create(session.user.id, parsed.data, decision);
    await attachModerationLogs(decision.logIds, reviewId);

    if (decision.status === "approved") {
      await notifyReviewCreated({ kind, bookingCode, rating });
    } else {
      await notifyContentFlagged({
        target: "review",
        id: reviewId,
        authorName: session.user.name ?? "Khách hàng",
        subject: serviceName ?? bookingCode,
        content,
        status: decision.status,
        reason: decision.reason,
      });
      revalidatePath("/admin/moderation");
    }

    revalidatePath(`${SERVICE_PATH[kind]}/${slug}`);
    revalidatePath(MY_BOOKINGS_PATH[kind]);
    revalidatePath("/explore");
    revalidatePath("/");
    return { status: decision.status };
  });
}
