"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { provinceRepo } from "@/entities/province";
import {
  operationalSettingsSchema,
  platformInfoSchema,
  systemSettingRepo,
  type SystemSettings,
} from "@/entities/system-setting";
import { tagRepo } from "@/entities/tag";
import {
  changePasswordSchema,
  updateProfileSchema,
  userRepo,
} from "@/entities/user";
import { slugify } from "@/lib/utils";
import {
  fromZodError,
  runAction,
  type ActionState,
} from "@/shared/lib/action-state";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/shared/lib/errors";
import { requireAdmin } from "@/shared/lib/require-admin";
import type {
  AdminProfileData,
  AdminProvinceItem,
  AdminTagItem,
} from "./types";
import { mapProvinceToAdminItem, mapTagToAdminItem } from "./utils";

const tagInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên thẻ")
    .max(80, "Tên thẻ tối đa 80 ký tự"),
  slug: z.string().trim().max(100, "Slug tối đa 100 ký tự").optional(),
});

const provinceInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên ngắn gọn (vd: Đà Nẵng)")
    .max(80, "Tên tỉnh/thành tối đa 80 ký tự"),
  fullName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên đầy đủ (vd: Thành phố Đà Nẵng)")
    .max(120, "Tên đầy đủ tối đa 120 ký tự"),
  slug: z.string().trim().max(100, "Slug tối đa 100 ký tự").optional(),
  type: z.enum(["province", "city"], {
    message: "Loại đơn vị hành chính không hợp lệ",
  }),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null))
    .refine(
      (v) => v === null || /^https?:\/\/.+/i.test(v),
      "URL ảnh đại diện phải bắt đầu bằng http:// hoặc https://",
    ),
});

function revalidateSettingsPaths() {
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/my-bookings");
  revalidatePath("/my-hotel-bookings");
  revalidatePath("/my-restaurant-bookings");
}

export async function saveOperationalSettingsAction(
  input: unknown,
): Promise<ActionState<SystemSettings>> {
  return runAction(async () => {
    await requireAdmin();
    const parsed = operationalSettingsSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));

    const updated = await systemSettingRepo.updateOperationalSettings(
      parsed.data,
    );
    revalidateSettingsPaths();
    return updated;
  });
}

export async function resetOperationalSettingsAction(): Promise<
  ActionState<SystemSettings>
> {
  return runAction(async () => {
    await requireAdmin();
    const updated = await systemSettingRepo.resetOperationalSettings();
    revalidateSettingsPaths();
    return updated;
  });
}

export async function savePlatformInfoAction(
  input: unknown,
): Promise<ActionState<SystemSettings>> {
  return runAction(async () => {
    await requireAdmin();
    const parsed = platformInfoSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));

    const updated = await systemSettingRepo.updatePlatformInfo(parsed.data);
    revalidateSettingsPaths();
    return updated;
  });
}

export async function createTagAction(
  input: unknown,
): Promise<ActionState<AdminTagItem>> {
  return runAction(async () => {
    await requireAdmin();
    const parsed = tagInputSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));

    const name = parsed.data.name;
    const slug = slugify(parsed.data.slug || name);
    if (!slug) {
      throw new ValidationError({ slug: ["Slug không hợp lệ."] });
    }

    const [byName, bySlug] = await Promise.all([
      tagRepo.findByName(name),
      tagRepo.findBySlug(slug),
    ]);
    const fieldErrors: Record<string, string[]> = {};
    if (byName) fieldErrors.name = ["Tên thẻ này đã tồn tại."];
    if (bySlug) fieldErrors.slug = ["Slug này đã tồn tại."];
    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidationError(fieldErrors);
    }

    const created = await tagRepo.create({ name, slug });
    revalidateSettingsPaths();
    return mapTagToAdminItem(created);
  });
}

export async function updateTagAction(
  id: string,
  input: unknown,
): Promise<ActionState<AdminTagItem>> {
  return runAction(async () => {
    await requireAdmin();
    const existing = await tagRepo.findById(id);
    if (!existing) throw new NotFoundError("Không tìm thấy thẻ cần chỉnh sửa.");

    const parsed = tagInputSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));

    const name = parsed.data.name;
    const slug = slugify(parsed.data.slug || name);
    if (!slug) {
      throw new ValidationError({ slug: ["Slug không hợp lệ."] });
    }

    const [byName, bySlug] = await Promise.all([
      tagRepo.findByName(name),
      tagRepo.findBySlug(slug),
    ]);
    const fieldErrors: Record<string, string[]> = {};
    if (byName && byName.id !== id) {
      fieldErrors.name = ["Tên thẻ này đã tồn tại."];
    }
    if (bySlug && bySlug.id !== id) {
      fieldErrors.slug = ["Slug này đã tồn tại."];
    }
    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidationError(fieldErrors);
    }

    const updated = await tagRepo.update(id, { name, slug });
    revalidateSettingsPaths();
    return mapTagToAdminItem(updated);
  });
}

export async function deleteTagAction(
  id: string,
): Promise<ActionState<{ id: string }>> {
  return runAction(async () => {
    await requireAdmin();
    const existing = await tagRepo.findById(id);
    if (!existing) throw new NotFoundError("Không tìm thấy thẻ cần xóa.");

    await tagRepo.remove(id);
    revalidateSettingsPaths();
    return { id };
  });
}

export async function createProvinceAction(
  input: unknown,
): Promise<ActionState<AdminProvinceItem>> {
  return runAction(async () => {
    await requireAdmin();
    const parsed = provinceInputSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));

    const { name, fullName, type, imageUrl } = parsed.data;
    const slug = slugify(parsed.data.slug || name);
    if (!slug) {
      throw new ValidationError({ slug: ["Slug không hợp lệ."] });
    }

    const [byName, bySlug] = await Promise.all([
      provinceRepo.findByName(name),
      provinceRepo.findBySlug(slug),
    ]);
    const fieldErrors: Record<string, string[]> = {};
    if (byName) fieldErrors.name = ["Tên tỉnh/thành phố này đã tồn tại."];
    if (bySlug) fieldErrors.slug = ["Slug này đã tồn tại."];
    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidationError(fieldErrors);
    }

    const created = await provinceRepo.create({
      name,
      fullName,
      slug,
      type,
      imageUrl: imageUrl ?? `https://picsum.photos/seed/${slug}/1200/800`,
    });
    revalidateSettingsPaths();
    return mapProvinceToAdminItem(created);
  });
}

export async function updateProvinceAction(
  id: string,
  input: unknown,
): Promise<ActionState<AdminProvinceItem>> {
  return runAction(async () => {
    await requireAdmin();
    const existing = await provinceRepo.findByIdWithUsageCount(id);
    if (!existing) {
      throw new NotFoundError("Không tìm thấy tỉnh/thành phố cần chỉnh sửa.");
    }

    const parsed = provinceInputSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));

    const { name, fullName, type, imageUrl } = parsed.data;
    const slug = slugify(parsed.data.slug || name);
    if (!slug) {
      throw new ValidationError({ slug: ["Slug không hợp lệ."] });
    }

    const [byName, bySlug] = await Promise.all([
      provinceRepo.findByName(name),
      provinceRepo.findBySlug(slug),
    ]);
    const fieldErrors: Record<string, string[]> = {};
    if (byName && byName.id !== id) {
      fieldErrors.name = ["Tên tỉnh/thành phố này đã tồn tại."];
    }
    if (bySlug && bySlug.id !== id) {
      fieldErrors.slug = ["Slug này đã tồn tại."];
    }
    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidationError(fieldErrors);
    }

    const updated = await provinceRepo.update(id, {
      name,
      fullName,
      slug,
      type,
      imageUrl,
    });
    revalidateSettingsPaths();
    return mapProvinceToAdminItem(updated);
  });
}

export async function deleteProvinceAction(
  id: string,
): Promise<ActionState<{ id: string }>> {
  return runAction(async () => {
    await requireAdmin();
    const existing = await provinceRepo.findByIdWithUsageCount(id);
    if (!existing) {
      throw new NotFoundError("Không tìm thấy tỉnh/thành phố cần xóa.");
    }

    const totalUsed =
      existing._count.tours +
      existing._count.hotels +
      existing._count.restaurants +
      existing._count.destinations;
    if (totalUsed > 0) {
      throw new ConflictError(
        `Không thể xóa "${existing.fullName}" vì đang có ${totalUsed} dịch vụ/địa điểm thuộc tỉnh/thành này.`,
      );
    }

    await provinceRepo.remove(id);
    revalidateSettingsPaths();
    return { id };
  });
}

export async function updateAdminProfileAction(
  input: unknown,
): Promise<ActionState<AdminProfileData>> {
  return runAction(async () => {
    const session = await requireAdmin();
    const userId = session.user.id;

    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));

    const [emailOwner, phoneOwner] = await Promise.all([
      userRepo.findByEmail(parsed.data.email),
      userRepo.findByPhone(parsed.data.phone),
    ]);
    const fieldErrors: Record<string, string[]> = {};
    if (emailOwner && emailOwner.id !== userId) {
      fieldErrors.email = ["Email này đã được sử dụng bởi tài khoản khác."];
    }
    if (phoneOwner && phoneOwner.id !== userId) {
      fieldErrors.phone = [
        "Số điện thoại này đã được sử dụng bởi tài khoản khác.",
      ];
    }
    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidationError(fieldErrors);
    }

    const updated = await userRepo.updateProfile(userId, parsed.data);
    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    return {
      id: updated.id,
      fullname: updated.fullname,
      email: updated.email,
      phone: updated.phone,
      createdAt: updated.createdAt.toISOString(),
    };
  });
}

export async function changeAdminPasswordAction(
  input: unknown,
): Promise<ActionState<{ ok: boolean }>> {
  return runAction(async () => {
    const session = await requireAdmin();
    const userId = session.user.id;

    const parsed = changePasswordSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(fromZodError(parsed.error));

    const hash = await userRepo.findPasswordHashById(userId);
    if (!hash) throw new NotFoundError("Không tìm thấy tài khoản quản trị.");

    const matched = await bcrypt.compare(parsed.data.current_password, hash);
    if (!matched) {
      throw new ValidationError({
        current_password: ["Mật khẩu hiện tại không chính xác."],
      });
    }

    const newHash = await bcrypt.hash(parsed.data.new_password, 10);
    await userRepo.updatePassword(userId, newHash);
    return { ok: true };
  });
}
