"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import {
  PAYPAL_REQUIRED_MESSAGE,
  isPayPalLinked,
} from "@/features/provider/payments/guard";
import { deleteImage, uploadImage } from "@/lib/imagekit";
import { embedText } from "@/lib/gemini";
import {
  deleteRestaurantEmbedding,
  upsertRestaurantEmbedding,
} from "@/lib/pinecone";
import { slugify } from "@/lib/utils";
import {
  createRestaurantSchema,
  restaurantRepo,
  type CreateRestaurantInput,
  type Restaurant,
} from "@/entities/restaurant";
import { providerProfileRepo } from "@/entities/provider-profile";
import { provinceRepo } from "@/entities/province";
import { tagRepo } from "@/entities/tag";
import type { ActionState } from "@/shared/lib/action-state";

export type CreateRestaurantActionState = ActionState;

type UploadedImage = { url: string; fileId: string };
type CreationStage =
  | "authorization"
  | "validation"
  | "upload"
  | "database"
  | "embedding";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/png", "image/jpeg"];
const MAX_PHOTOS = 5;
const MAX_SLUG_ATTEMPTS = 5;
const CLEANUP_ATTEMPTS = 3;

const STAGE_ERROR_MESSAGES: Record<CreationStage, string> = {
  authorization: "Không thể xác thực tài khoản. Vui lòng thử lại.",
  validation: "Không thể kiểm tra dữ liệu nhà hàng. Vui lòng thử lại.",
  upload: "Không thể tải ảnh lên. Các ảnh đã tải sẽ được xóa.",
  database: "Không thể tạo nhà hàng. Các tài nguyên đã tạo sẽ được xóa.",
  embedding:
    "Không thể tạo dữ liệu tìm kiếm cho nhà hàng. Các tài nguyên đã tạo sẽ được xóa.",
};

function parseJsonField<T>(formData: FormData, key: string, fallback: T): T {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.length === 0) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function hasValidImageSignature(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isJpeg =
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff;
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const isPng =
    bytes.length >= pngSignature.length &&
    pngSignature.every((byte, index) => bytes[index] === byte);

  return isJpeg || isPng;
}

async function retryCleanup(operation: () => Promise<unknown>): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt < CLEANUP_ATTEMPTS; attempt += 1) {
    try {
      await operation();
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function validatePhotos(
  photos: File[]
): Promise<{ status: "error"; fieldErrors: Record<string, string[]> } | null> {
  if (photos.length === 0) {
    return {
      status: "error",
      fieldErrors: { photos: ["Cần ít nhất 1 ảnh."] },
    };
  }
  if (photos.length > MAX_PHOTOS) {
    return {
      status: "error",
      fieldErrors: { photos: [`Tối đa ${MAX_PHOTOS} ảnh.`] },
    };
  }
  for (const photo of photos) {
    if (
      !ALLOWED_PHOTO_TYPES.includes(photo.type) ||
      photo.size > MAX_PHOTO_SIZE ||
      !(await hasValidImageSignature(photo))
    ) {
      return {
        status: "error",
        fieldErrors: {
          photos: ["Ảnh phải là PNG/JPG hợp lệ và dưới 5MB."],
        },
      };
    }
  }
  return null;
}

async function createRestaurantWithUniqueSlug(
  input: CreateRestaurantInput & {
    providerProfileId: string;
    images: UploadedImage[];
  }
): Promise<Restaurant> {
  const baseSlug = slugify(input.name) || "restaurant";

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const slug =
      attempt === 0 ? baseSlug : `${baseSlug}-${randomUUID().slice(0, 8)}`;

    try {
      return await restaurantRepo.create({ ...input, slug });
    } catch (error) {
      if (
        !isUniqueConstraintError(error) ||
        attempt === MAX_SLUG_ATTEMPTS - 1
      ) {
        throw error;
      }
    }
  }

  throw new Error("Không thể tạo slug duy nhất cho nhà hàng.");
}

async function rollbackRestaurantCreation(input: {
  uploadedImages: UploadedImage[];
  createdRestaurantId: string | null;
  embeddingUpsertAttempted: boolean;
}): Promise<{ resource: string; reason: unknown }[]> {
  const failures: { resource: string; reason: unknown }[] = [];

  if (input.embeddingUpsertAttempted && input.createdRestaurantId) {
    try {
      await retryCleanup(() =>
        deleteRestaurantEmbedding(input.createdRestaurantId!)
      );
    } catch (reason) {
      failures.push({
        resource: `pinecone:${input.createdRestaurantId}`,
        reason,
      });
    }
  }

  if (input.createdRestaurantId) {
    try {
      await retryCleanup(() =>
        restaurantRepo.remove(input.createdRestaurantId!)
      );
    } catch (reason) {
      failures.push({
        resource: `restaurant:${input.createdRestaurantId}`,
        reason,
      });
    }
  }

  const imageCleanupResults = await Promise.allSettled(
    input.uploadedImages.map((image) =>
      retryCleanup(() => deleteImage(image.fileId))
    )
  );
  imageCleanupResults.forEach((result, index) => {
    if (result.status === "rejected") {
      failures.push({
        resource: `imagekit:${input.uploadedImages[index].fileId}`,
        reason: result.reason,
      });
    }
  });

  return failures;
}

export async function createRestaurantAction(
  _prevState: CreateRestaurantActionState,
  formData: FormData
): Promise<CreateRestaurantActionState> {
  const uploadedImages: UploadedImage[] = [];
  let createdRestaurantId: string | null = null;
  let embeddingUpsertAttempted = false;
  let stage: CreationStage = "authorization";

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error", formError: "Vui lòng đăng nhập lại." };
    }
    if (session.user.role !== "provider") {
      return {
        status: "error",
        formError: "Chỉ tài khoản đối tác mới có thể tạo nhà hàng.",
      };
    }

    const providerProfile =
      await providerProfileRepo.findApprovedByUserIdAndBusinessType(
        session.user.id,
        "restaurant"
      );
    if (!providerProfile) {
      return {
        status: "error",
        formError:
          "Tài khoản phải đang hoạt động và có hồ sơ doanh nghiệp loại Nhà hàng đã được duyệt.",
      };
    }
    if (!isPayPalLinked(providerProfile)) {
      return { status: "error", formError: PAYPAL_REQUIRED_MESSAGE };
    }

    stage = "validation";
    const parsed = createRestaurantSchema.safeParse({
      name: formData.get("name"),
      provinceId: formData.get("provinceId"),
      address: formData.get("address"),
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
      phone: formData.get("phone") ?? "",
      capacity: formData.get("capacity"),
      description: formData.get("description") ?? "",
      tagIds: parseJsonField<string[]>(formData, "tagIds", []),
      menu: parseJsonField<unknown[]>(formData, "menu", []),
      timeSlots: parseJsonField<unknown[]>(formData, "timeSlots", []),
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

    const photos = formData
      .getAll("photos")
      .filter((file): file is File => file instanceof File && file.size > 0);
    const photoError = await validatePhotos(photos);
    if (photoError) return photoError;

    const province = await provinceRepo.findById(parsed.data.provinceId);
    if (!province) {
      return {
        status: "error",
        fieldErrors: { provinceId: ["Tỉnh/thành đã chọn không tồn tại."] },
      };
    }

    const uniqueTagIds = [...new Set(parsed.data.tagIds)];
    if (uniqueTagIds.length > 0) {
      const existingTags = await tagRepo.findManyByIds(uniqueTagIds);
      if (existingTags.length !== uniqueTagIds.length) {
        return {
          status: "error",
          fieldErrors: { tagIds: ["Một số tag đã chọn không tồn tại."] },
        };
      }
    }

    stage = "upload";
    const uploadResults = await Promise.allSettled(
      photos.map((photo) =>
        uploadImage(photo, `restaurants/${providerProfile.id}`)
      )
    );

    const images: UploadedImage[] = [];
    for (const result of uploadResults) {
      if (result.status === "fulfilled") {
        images.push({ url: result.value.url, fileId: result.value.fileId });
        uploadedImages.push({
          url: result.value.url,
          fileId: result.value.fileId,
        });
      }
    }

    const uploadFailure = uploadResults.find(
      (result): result is PromiseRejectedResult => result.status === "rejected"
    );
    if (uploadFailure) throw uploadFailure.reason;

    stage = "database";
    const restaurant = await createRestaurantWithUniqueSlug({
      ...parsed.data,
      tagIds: uniqueTagIds,
      providerProfileId: providerProfile.id,
      images,
    });
    createdRestaurantId = restaurant.id;

    stage = "embedding";
    const embeddingText = [
      parsed.data.name,
      parsed.data.description,
      province.fullName,
      parsed.data.address,
      parsed.data.menu.map((item) => item.name).join(", "),
      parsed.data.menu.map((item) => item.description).join(", "),
    ]
      .filter(Boolean)
      .join("\n");

    const vector = await embedText(embeddingText);
    embeddingUpsertAttempted = true;
    await upsertRestaurantEmbedding(restaurant.id, vector, {
      name: parsed.data.name,
      provinceId: parsed.data.provinceId,
      tagIds: uniqueTagIds,
      status: restaurant.status,
      providerProfileId: providerProfile.id,
    });
  } catch (error) {
    const cleanupFailures = await rollbackRestaurantCreation({
      uploadedImages,
      createdRestaurantId,
      embeddingUpsertAttempted,
    });

    console.error("Tạo nhà hàng thất bại", {
      stage,
      createdRestaurantId,
      error,
      cleanupFailures,
    });

    return {
      status: "error",
      formError: STAGE_ERROR_MESSAGES[stage],
    };
  }

  revalidatePath("/provider/restaurants");
  redirect("/provider/restaurants");
}

export async function createRestaurantFromLinksAction(
  _prevState: CreateRestaurantActionState,
  formData: FormData
): Promise<CreateRestaurantActionState> {
  let createdRestaurantId: string | null = null;
  let embeddingUpsertAttempted = false;
  let stage: CreationStage = "authorization";

  try {
    const providerProfileId = formData.get("providerProfileId");
    if (typeof providerProfileId !== "string" || !providerProfileId) {
      return { status: "error", formError: "Thiếu hồ sơ nhà cung cấp." };
    }
    if (!(await providerProfileRepo.isPayPalLinkedById(providerProfileId))) {
      return { status: "error", formError: PAYPAL_REQUIRED_MESSAGE };
    }

    stage = "validation";
    const parsed = createRestaurantSchema.safeParse({
      name: formData.get("name"),
      provinceId: formData.get("provinceId"),
      address: formData.get("address"),
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
      phone: formData.get("phone") ?? "",
      capacity: formData.get("capacity"),
      description: formData.get("description") ?? "",
      tagIds: parseJsonField<string[]>(formData, "tagIds", []),
      menu: parseJsonField<unknown[]>(formData, "menu", []),
      timeSlots: parseJsonField<unknown[]>(formData, "timeSlots", []),
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

    const imageUrls = parseJsonField<string[]>(formData, "imageUrls", []);

    const province = await provinceRepo.findById(parsed.data.provinceId);
    if (!province) {
      return {
        status: "error",
        fieldErrors: { provinceId: ["Tỉnh/thành đã chọn không tồn tại."] },
      };
    }

    const tagIds = [...new Set(parsed.data.tagIds)];
    const tags = await tagRepo.findManyByIds(tagIds);
    if (tags.length !== tagIds.length) {
      return {
        status: "error",
        fieldErrors: { tagIds: ["Một hoặc nhiều thẻ đã chọn không tồn tại."] },
      };
    }

    stage = "database";
    const restaurant = await createRestaurantWithUniqueSlug({
      ...parsed.data,
      tagIds,
      providerProfileId,
      images: imageUrls.map((url) => ({ url, fileId: url })),
    });
    createdRestaurantId = restaurant.id;

    stage = "embedding";
    const embeddingText = [
      parsed.data.name,
      parsed.data.description,
      province.fullName,
      parsed.data.address,
      tags.map((tag) => tag.name).join(", "),
      parsed.data.menu.map((item) => item.name).join(", "),
      parsed.data.menu.map((item) => item.description).join(", "),
    ]
      .filter(Boolean)
      .join("\n");

    const vector = await embedText(embeddingText);
    embeddingUpsertAttempted = true;
    await upsertRestaurantEmbedding(restaurant.id, vector, {
      name: parsed.data.name,
      provinceId: parsed.data.provinceId,
      tagIds,
      status: restaurant.status,
      providerProfileId,
    });
  } catch (error) {
    const cleanupFailures = await rollbackRestaurantCreation({
      uploadedImages: [],
      createdRestaurantId,
      embeddingUpsertAttempted,
    });

    console.error("Tạo nhà hàng thất bại", {
      stage,
      createdRestaurantId,
      error,
      cleanupFailures,
    });

    return {
      status: "error",
      formError: STAGE_ERROR_MESSAGES[stage],
    };
  }

  return { status: "success" };
}
