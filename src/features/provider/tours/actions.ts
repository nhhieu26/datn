"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { deleteImage, uploadImage } from "@/lib/imagekit";
import { embedText } from "@/lib/gemini";
import { deleteTourEmbedding, upsertTourEmbedding } from "@/lib/pinecone";
import { slugify } from "@/lib/utils";
import {
  createTourSchema,
  tourRepo,
  type CreateTourInput,
  type Tour,
} from "@/entities/tour";
import { providerProfileRepo } from "@/entities/provider-profile";
import { provinceRepo } from "@/entities/province";
import { tagRepo } from "@/entities/tag";
import type { ActionState } from "@/shared/lib/action-state";

export type CreateTourActionState = ActionState;

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
  validation: "Không thể kiểm tra dữ liệu tour. Vui lòng thử lại.",
  upload: "Không thể tải ảnh lên. Các ảnh đã tải sẽ được xóa.",
  database: "Không thể tạo tour. Các tài nguyên đã tạo sẽ được xóa.",
  embedding:
    "Không thể tạo dữ liệu tìm kiếm cho tour. Các tài nguyên đã tạo sẽ được xóa.",
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

async function createTourWithUniqueSlug(
  input: CreateTourInput & {
    providerProfileId: string;
    images: UploadedImage[];
  },
): Promise<Tour> {
  const baseSlug = slugify(input.title) || "tour";

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const slug =
      attempt === 0 ? baseSlug : `${baseSlug}-${randomUUID().slice(0, 8)}`;

    try {
      return await tourRepo.create({ ...input, slug });
    } catch (error) {
      if (
        !isUniqueConstraintError(error) ||
        attempt === MAX_SLUG_ATTEMPTS - 1
      ) {
        throw error;
      }
    }
  }

  throw new Error("Không thể tạo slug duy nhất cho tour.");
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

async function rollbackTourCreation(input: {
  uploadedImages: UploadedImage[];
  createdTourId: string | null;
  embeddingUpsertAttempted: boolean;
}): Promise<{ resource: string; reason: unknown }[]> {
  const failures: { resource: string; reason: unknown }[] = [];

  if (input.embeddingUpsertAttempted && input.createdTourId) {
    try {
      await retryCleanup(() => deleteTourEmbedding(input.createdTourId!));
    } catch (reason) {
      failures.push({ resource: `pinecone:${input.createdTourId}`, reason });
    }
  }

  if (input.createdTourId) {
    try {
      await retryCleanup(() => tourRepo.remove(input.createdTourId!));
    } catch (reason) {
      failures.push({ resource: `tour:${input.createdTourId}`, reason });
    }
  }

  const imageCleanupResults = await Promise.allSettled(
    input.uploadedImages.map((image) =>
      retryCleanup(() => deleteImage(image.fileId)),
    ),
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

export async function createTourAction(
  _prevState: CreateTourActionState,
  formData: FormData,
): Promise<CreateTourActionState> {
  const uploadedImages: UploadedImage[] = [];
  let createdTourId: string | null = null;
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
        formError: "Chỉ tài khoản đối tác mới có thể tạo tour.",
      };
    }

    const providerProfile =
      await providerProfileRepo.findApprovedByUserIdAndBusinessType(
        session.user.id,
        "tour",
      );
    if (!providerProfile) {
      return {
        status: "error",
        formError:
          "Tài khoản phải đang hoạt động và có hồ sơ doanh nghiệp loại Tour đã được duyệt.",
      };
    }

    stage = "validation";
    const parsed = createTourSchema.safeParse({
      title: formData.get("title"),
      provinceId: formData.get("provinceId"),
      tagIds: parseJsonField<string[]>(formData, "tagIds", []),
      durationDays: formData.get("durationDays"),
      durationNights: formData.get("durationNights"),
      description: formData.get("description"),
      includeServices: parseJsonField<string[]>(
        formData,
        "includeServices",
        [],
      ),
      excludeServices: parseJsonField<string[]>(
        formData,
        "excludeServices",
        [],
      ),
      itinerary: parseJsonField(formData, "itinerary", []),
      basePrice: formData.get("basePrice"),
      departures: parseJsonField(formData, "departures", []),
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

    const photos = formData.getAll("photos").filter((file): file is File => {
      return file instanceof File && file.size > 0;
    });
    if (photos.length === 0) {
      return {
        status: "error",
        fieldErrors: { photos: ["Cần ít nhất 1 ảnh cho tour."] },
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
          fieldErrors: { photos: ["Ảnh phải là PNG/JPG hợp lệ và dưới 5MB."] },
        };
      }
    }

    const tagIds = [...new Set(parsed.data.tagIds)];
    const [province, tags] = await Promise.all([
      provinceRepo.findById(parsed.data.provinceId),
      tagRepo.findManyByIds(tagIds),
    ]);
    if (!province) {
      return {
        status: "error",
        fieldErrors: { provinceId: ["Tỉnh/thành đã chọn không tồn tại."] },
      };
    }
    if (tags.length !== tagIds.length) {
      return {
        status: "error",
        fieldErrors: { tagIds: ["Một hoặc nhiều thẻ đã chọn không tồn tại."] },
      };
    }

    stage = "upload";
    const uploadResults = await Promise.allSettled(
      photos.map((photo) => uploadImage(photo, `tours/${providerProfile.id}`)),
    );
    for (const result of uploadResults) {
      if (result.status === "fulfilled") {
        uploadedImages.push({
          url: result.value.url,
          fileId: result.value.fileId,
        });
      }
    }
    const uploadFailure = uploadResults.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (uploadFailure) throw uploadFailure.reason;

    stage = "database";
    const tour = await createTourWithUniqueSlug({
      ...parsed.data,
      tagIds,
      providerProfileId: providerProfile.id,
      images: uploadedImages,
    });
    createdTourId = tour.id;

    stage = "embedding";
    const embeddingText = [
      parsed.data.title,
      parsed.data.description,
      province.fullName,
      tags.map((tag) => tag.name).join(", "),
      parsed.data.itinerary.map((day) => day.title).join(", "),
      parsed.data.includeServices.join(", "),
    ]
      .filter(Boolean)
      .join("\n");

    const vector = await embedText(embeddingText);
    embeddingUpsertAttempted = true;
    await upsertTourEmbedding(tour.id, vector, {
      title: parsed.data.title,
      provinceId: parsed.data.provinceId,
      tagIds,
      status: tour.status,
      providerProfileId: providerProfile.id,
    });
  } catch (error) {
    const cleanupFailures = await rollbackTourCreation({
      uploadedImages,
      createdTourId,
      embeddingUpsertAttempted,
    });

    console.error("Tạo tour thất bại", {
      stage,
      createdTourId,
      error,
      cleanupFailures,
    });

    return {
      status: "error",
      formError: STAGE_ERROR_MESSAGES[stage],
    };
  }

  revalidatePath("/provider/tours");
  redirect("/provider/tours");
}

export async function createTourFromLinksAction(
  _prevState: CreateTourActionState,
  formData: FormData,
): Promise<CreateTourActionState> {
  let createdTourId: string | null = null;
  let embeddingUpsertAttempted = false;
  let stage: CreationStage = "authorization";

  try {
    const providerProfileId = formData.get("providerProfileId");
    if (typeof providerProfileId !== "string" || !providerProfileId) {
      return { status: "error", formError: "Thiếu hồ sơ nhà cung cấp." };
    }

    stage = "validation";
    const parsed = createTourSchema.safeParse({
      title: formData.get("title"),
      provinceId: formData.get("provinceId"),
      tagIds: parseJsonField<string[]>(formData, "tagIds", []),
      durationDays: formData.get("durationDays"),
      durationNights: formData.get("durationNights"),
      description: formData.get("description"),
      includeServices: parseJsonField<string[]>(
        formData,
        "includeServices",
        [],
      ),
      excludeServices: parseJsonField<string[]>(
        formData,
        "excludeServices",
        [],
      ),
      itinerary: parseJsonField(formData, "itinerary", []),
      basePrice: formData.get("basePrice"),
      departures: parseJsonField(formData, "departures", []),
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

    const tagIds = [...new Set(parsed.data.tagIds)];
    const [province, tags] = await Promise.all([
      provinceRepo.findById(parsed.data.provinceId),
      tagRepo.findManyByIds(tagIds),
    ]);
    if (!province) {
      return {
        status: "error",
        fieldErrors: { provinceId: ["Tỉnh/thành đã chọn không tồn tại."] },
      };
    }
    if (tags.length !== tagIds.length) {
      return {
        status: "error",
        fieldErrors: { tagIds: ["Một hoặc nhiều thẻ đã chọn không tồn tại."] },
      };
    }

    stage = "database";
    const tour = await createTourWithUniqueSlug({
      ...parsed.data,
      tagIds,
      providerProfileId,
      images: imageUrls.map((url) => ({ url, fileId: url })),
    });
    createdTourId = tour.id;

    stage = "embedding";
    const embeddingText = [
      parsed.data.title,
      parsed.data.description,
      province.fullName,
      tags.map((tag) => tag.name).join(", "),
      parsed.data.itinerary.map((day) => day.title).join(", "),
      parsed.data.includeServices.join(", "),
    ]
      .filter(Boolean)
      .join("\n");

    const vector = await embedText(embeddingText);
    embeddingUpsertAttempted = true;
    await upsertTourEmbedding(tour.id, vector, {
      title: parsed.data.title,
      provinceId: parsed.data.provinceId,
      tagIds,
      status: tour.status,
      providerProfileId,
    });
  } catch (error) {
    const cleanupFailures = await rollbackTourCreation({
      uploadedImages: [],
      createdTourId,
      embeddingUpsertAttempted,
    });

    console.error("Tạo tour thất bại", {
      stage,
      createdTourId,
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
