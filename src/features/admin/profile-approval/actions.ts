"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { providerProfileRepo } from "@/entities/provider-profile";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/shared/lib/errors";
import {
  fromZodError,
  runAction,
  type ActionState,
} from "@/shared/lib/action-state";
import type { ApprovalMutationResult, ApprovalProfilePatch } from "./types";

const approveProfilesSchema = z.object({
  ids: z
    .array(z.string().trim().min(1))
    .min(1, "Vui lòng chọn ít nhất một hồ sơ.")
    .max(100, "Chỉ có thể duyệt tối đa 100 hồ sơ mỗi lần."),
});

const rejectProfileSchema = z.object({
  id: z.string().trim().min(1),
  reason: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do từ chối.")
    .max(1000, "Lý do từ chối tối đa 1000 ký tự."),
});

function toPatch(
  profile: Awaited<
    ReturnType<typeof providerProfileRepo.findApprovalStatesByIds>
  >[number]
): ApprovalProfilePatch {
  if (profile.approvalStatus === "not_submitted") {
    throw new ConflictError("Hồ sơ chưa được gửi để xét duyệt.");
  }

  return {
    ...profile,
    approvalStatus: profile.approvalStatus,
    updatedAt: profile.updatedAt.toISOString(),
  };
}

function revalidateApprovalPages() {
  revalidatePath("/admin/profile-approval");
  revalidatePath("/provider/profiles");
}

export async function approveProviderProfilesAction(
  ids: string[]
): Promise<ActionState<ApprovalMutationResult>> {
  const result = await runAction<ApprovalMutationResult>(async () => {
    const parsed = approveProfilesSchema.safeParse({ ids });
    if (!parsed.success) {
      throw new ValidationError(fromZodError(parsed.error));
    }

    const uniqueIds = [...new Set(parsed.data.ids)];
    const existing = await providerProfileRepo.findApprovalStatesByIds(uniqueIds);
    if (existing.length !== uniqueIds.length) {
      throw new NotFoundError("Có hồ sơ không còn tồn tại.");
    }
    if (existing.some((profile) => profile.approvalStatus === "not_submitted")) {
      throw new ConflictError("Có hồ sơ chưa được gửi để xét duyệt.");
    }

    const updated = await providerProfileRepo.approvePendingByIds(uniqueIds);
    const profiles = await providerProfileRepo.findApprovalStatesByIds(uniqueIds);

    return {
      profiles: profiles.map(toPatch),
      updatedCount: updated.count,
    };
  });

  if (result.status === "success") {
    revalidateApprovalPages();
  }
  return result;
}

export async function rejectProviderProfileAction(
  id: string,
  reason: string
): Promise<ActionState<ApprovalMutationResult>> {
  const result = await runAction<ApprovalMutationResult>(async () => {
    const parsed = rejectProfileSchema.safeParse({ id, reason });
    if (!parsed.success) {
      throw new ValidationError(fromZodError(parsed.error));
    }

    const existing = await providerProfileRepo.findApprovalStatesByIds([
      parsed.data.id,
    ]);
    if (existing.length === 0) {
      throw new NotFoundError("Không tìm thấy hồ sơ.");
    }
    if (existing[0].approvalStatus !== "pending") {
      throw new ConflictError("Hồ sơ này đã được xử lý trước đó.");
    }

    const updated = await providerProfileRepo.rejectPendingById(
      parsed.data.id,
      parsed.data.reason
    );
    if (updated.count === 0) {
      throw new ConflictError("Hồ sơ này đã được xử lý trước đó.");
    }

    const profiles = await providerProfileRepo.findApprovalStatesByIds([
      parsed.data.id,
    ]);

    return {
      profiles: profiles.map(toPatch),
      updatedCount: updated.count,
    };
  });

  if (result.status === "success") {
    revalidateApprovalPages();
  }
  return result;
}
