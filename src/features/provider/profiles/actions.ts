"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { deleteImage, uploadImage } from "@/lib/imagekit";
import {
  createProviderProfileSchema,
  providerProfileRepo,
  updateProviderProfileSchema,
} from "@/entities/provider-profile";

export type CreateProfileActionState = {
  status: "idle" | "error" | "success";
  formError?: string;
  fieldErrors?: Record<string, string[]>;
};

const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg"];

export async function createProviderProfileAction(
  _prevState: CreateProfileActionState,
  formData: FormData
): Promise<CreateProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", formError: "Vui lòng đăng nhập lại." };
  }
  if (session.user.role !== "provider") {
    return {
      status: "error",
      formError: "Chỉ tài khoản đối tác mới có thể tạo hồ sơ doanh nghiệp.",
    };
  }

  const parsed = createProviderProfileSchema.safeParse({
    businessName: formData.get("businessName"),
    businessType: formData.get("businessType"),
    taxCode: formData.get("taxCode"),
    address: formData.get("address"),
    description: formData.get("description"),
    licenseUrl: formData.get("legalDocUrl"),
    website: formData.get("websiteUrl"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const existingTypes = await providerProfileRepo.findBusinessTypesByUserId(
    session.user.id
  );
  if (existingTypes.includes(parsed.data.businessType)) {
    return {
      status: "error",
      fieldErrors: {
        businessType: ["Bạn đã có hồ sơ cho loại hình này."],
      },
    };
  }

  const logo = formData.get("logo");
  let photoUrl: string | null = null;
  let photoFileId: string | null = null;
  if (logo instanceof File && logo.size > 0) {
    if (!ALLOWED_LOGO_TYPES.includes(logo.type) || logo.size > MAX_LOGO_SIZE) {
      return {
        status: "error",
        fieldErrors: { logo: ["Ảnh phải là PNG/JPG và dưới 5MB."] },
      };
    }
    const uploaded = await uploadImage(
      logo,
      `provider-profiles/${session.user.id}`
    );
    photoUrl = uploaded.url;
    photoFileId = uploaded.fileId;
  }

  await providerProfileRepo.create({
    ...parsed.data,
    userId: session.user.id,
    photoUrl,
    photoFileId,
  });

  revalidatePath("/provider/profiles");
  redirect("/provider/profiles");
}

export async function updateProviderProfileAction(
  profileId: string,
  _prevState: CreateProfileActionState,
  formData: FormData
): Promise<CreateProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", formError: "Vui lòng đăng nhập lại." };
  }
  if (session.user.role !== "provider") {
    return {
      status: "error",
      formError: "Chỉ tài khoản đối tác mới có thể chỉnh sửa hồ sơ doanh nghiệp.",
    };
  }

  const existing = await providerProfileRepo.findById(
    profileId,
    session.user.id
  );
  if (!existing) {
    return { status: "error", formError: "Không tìm thấy hồ sơ." };
  }

  const parsed = updateProviderProfileSchema.safeParse({
    businessName: formData.get("businessName"),
    taxCode: formData.get("taxCode"),
    address: formData.get("address"),
    description: formData.get("description"),
    licenseUrl: formData.get("legalDocUrl"),
    website: formData.get("websiteUrl"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const logo = formData.get("logo");
  const removeLogo = formData.get("removeLogo") === "true";
  let photoUrl = existing.photoUrl;
  let photoFileId = existing.photoFileId;
  let photoChanged = false;

  if (logo instanceof File && logo.size > 0) {
    if (!ALLOWED_LOGO_TYPES.includes(logo.type) || logo.size > MAX_LOGO_SIZE) {
      return {
        status: "error",
        fieldErrors: { logo: ["Ảnh phải là PNG/JPG và dưới 5MB."] },
      };
    }
    const uploaded = await uploadImage(
      logo,
      `provider-profiles/${session.user.id}`
    );
    if (existing.photoFileId) {
      try {
        await deleteImage(existing.photoFileId);
      } catch {
        // ignore: cleanup failure shouldn't block saving the profile
      }
    }
    photoUrl = uploaded.url;
    photoFileId = uploaded.fileId;
    photoChanged = true;
  } else if (removeLogo && existing.photoUrl) {
    if (existing.photoFileId) {
      try {
        await deleteImage(existing.photoFileId);
      } catch {
        // ignore: cleanup failure shouldn't block saving the profile
      }
    }
    photoUrl = null;
    photoFileId = null;
    photoChanged = true;
  }

  const normalize = (value: string | null | undefined) => value?.trim() || null;
  const changedCount =
    [
      parsed.data.businessName !== existing.businessName,
      parsed.data.taxCode !== existing.taxCode,
      parsed.data.address !== existing.address,
      parsed.data.description !== existing.description,
      normalize(parsed.data.licenseUrl) !== normalize(existing.licenseUrl),
      normalize(parsed.data.website) !== normalize(existing.website),
    ].filter(Boolean).length + (photoChanged ? 1 : 0);

  const approvalStatus =
    changedCount > 1 ? "pending" : existing.approvalStatus;
  const rejectionReason =
    approvalStatus === "pending" ? null : existing.rejectionReason;

  await providerProfileRepo.update(profileId, {
    ...parsed.data,
    photoUrl,
    photoFileId,
    approvalStatus,
    rejectionReason,
  });

  revalidatePath("/provider/profiles");
  redirect("/provider/profiles");
}
