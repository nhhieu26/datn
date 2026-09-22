"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/imagekit";
import { createProviderProfileSchema, providerProfileRepo } from "@/entities/provider-profile";

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
  if (logo instanceof File && logo.size > 0) {
    if (!ALLOWED_LOGO_TYPES.includes(logo.type) || logo.size > MAX_LOGO_SIZE) {
      return {
        status: "error",
        fieldErrors: { logo: ["Ảnh phải là PNG/JPG và dưới 5MB."] },
      };
    }
    photoUrl = await uploadImage(
      logo,
      `provider-profiles/${session.user.id}`
    );
  }

  await providerProfileRepo.create({
    ...parsed.data,
    userId: session.user.id,
    photoUrl,
  });

  revalidatePath("/provider/profiles");
  redirect("/provider/profiles");
}
