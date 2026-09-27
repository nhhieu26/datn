"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { deleteImage, uploadImage } from "@/lib/imagekit";
import { embedText } from "@/lib/gemini";
import {
  deleteDestinationEmbedding,
  upsertDestinationEmbedding,
} from "@/lib/pinecone";
import { slugify } from "@/lib/utils";
import {
  createDestinationSchema,
  destinationRepo,
  type CreateDestinationInput,
  type Destination,
} from "@/entities/destination";
import { provinceRepo } from "@/entities/province";
import { tagRepo } from "@/entities/tag";
import type { ActionState } from "@/shared/lib/action-state";

export type CreateDestinationActionState = ActionState;

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
  validation: "Không thể kiểm tra dữ liệu địa điểm. Vui lòng thử lại.",
  upload: "Không thể tải ảnh lên. Các ảnh đã tải sẽ được xóa.",
  database: "Không thể tạo địa điểm. Các tài nguyên đã tạo sẽ được xóa.",
  embedding:
    "Không thể tạo dữ liệu tìm kiếm cho địa điểm. Các tài nguyên đã tạo sẽ được xóa.",
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

async function createDestinationWithUniqueSlug(
  input: CreateDestinationInput & {
    images: UploadedImage[];
  }
): Promise<Destination> {
  const baseSlug = slugify(input.name) || "dia-diem";

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const slug =
      attempt === 0 ? baseSlug : `${baseSlug}-${randomUUID().slice(0, 8)}`;

    try {
      return await destinationRepo.create({ ...input, slug });
    } catch (error) {
      if (
        !isUniqueConstraintError(error) ||
        attempt === MAX_SLUG_ATTEMPTS - 1
      ) {
        throw error;
      }
    }
  }

  throw new Error("Không thể tạo slug duy nhất cho địa điểm.");
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

async function rollbackDestinationCreation(input: {
  uploadedImages: UploadedImage[];
  createdDestinationId: string | null;
  embeddingUpsertAttempted: boolean;
}): Promise<{ resource: string; reason: unknown }[]> {
  const failures: { resource: string; reason: unknown }[] = [];

  if (input.embeddingUpsertAttempted && input.createdDestinationId) {
    try {
      await retryCleanup(() =>
        deleteDestinationEmbedding(input.createdDestinationId!)
      );
    } catch (reason) {
      failures.push({
        resource: `pinecone:${input.createdDestinationId}`,
        reason,
      });
    }
  }

  if (input.createdDestinationId) {
    try {
      await retryCleanup(() => destinationRepo.remove(input.createdDestinationId!));
    } catch (reason) {
      failures.push({
        resource: `destination:${input.createdDestinationId}`,
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

export async function createDestinationAction(
  _prevState: CreateDestinationActionState,
  formData: FormData
): Promise<CreateDestinationActionState> {
  const uploadedImages: UploadedImage[] = [];
  let createdDestinationId: string | null = null;
  let embeddingUpsertAttempted = false;
  let stage: CreationStage = "authorization";

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error", formError: "Vui lòng đăng nhập lại." };
    }
    if (session.user.role !== "admin") {
      return {
        status: "error",
        formError: "Chỉ tài khoản quản trị mới có thể tạo địa điểm.",
      };
    }

    stage = "validation";
    const parsed = createDestinationSchema.safeParse({
      name: formData.get("name"),
      provinceId: formData.get("provinceId"),
      address: formData.get("address"),
      description: formData.get("description"),
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
      ticketPrice: formData.get("ticketPrice"),
      isPublished: formData.get("isPublished") ?? "true",
      tagIds: parseJsonField<string[]>(formData, "tagIds", []),
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
        fieldErrors: { photos: ["Cần ít nhất 1 ảnh cho địa điểm."] },
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
      photos.map((photo) => uploadImage(photo, "destinations/admin"))
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
      (result): result is PromiseRejectedResult => result.status === "rejected"
    );
    if (uploadFailure) throw uploadFailure.reason;

    stage = "database";
    const destination = await createDestinationWithUniqueSlug({
      ...parsed.data,
      tagIds,
      images: uploadedImages,
    });
    createdDestinationId = destination.id;

    stage = "embedding";
    const embeddingText = [
      parsed.data.name,
      parsed.data.description,
      province.fullName,
      parsed.data.address,
      tags.map((tag) => tag.name).join(", "),
    ]
      .filter(Boolean)
      .join("\n");

    const vector = await embedText(embeddingText);
    embeddingUpsertAttempted = true;
    await upsertDestinationEmbedding(destination.id, vector, {
      name: parsed.data.name,
      provinceId: parsed.data.provinceId,
      tagIds,
      isPublished: parsed.data.isPublished,
    });
  } catch (error) {
    const cleanupFailures = await rollbackDestinationCreation({
      uploadedImages,
      createdDestinationId,
      embeddingUpsertAttempted,
    });

    console.error("Tạo địa điểm thất bại", {
      stage,
      createdDestinationId,
      error,
      cleanupFailures,
    });

    return {
      status: "error",
      formError: STAGE_ERROR_MESSAGES[stage],
    };
  }

  revalidatePath("/admin/destinations");
  redirect("/admin/destinations");
}
