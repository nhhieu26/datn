"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { deleteImage, uploadImage } from "@/lib/imagekit";
import { embedText } from "@/lib/gemini";
import { deleteHotelEmbedding, upsertHotelEmbedding } from "@/lib/pinecone";
import { slugify } from "@/lib/utils";
import {
  createHotelSchema,
  hotelRepo,
  type CreateHotelInput,
  type Hotel,
  type RoomDraftInput,
} from "@/entities/hotel";
import { providerProfileRepo } from "@/entities/provider-profile";
import { provinceRepo } from "@/entities/province";
import type { ActionState } from "@/shared/lib/action-state";

export type CreateHotelActionState = ActionState;

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
  validation: "Không thể kiểm tra dữ liệu khách sạn. Vui lòng thử lại.",
  upload: "Không thể tải ảnh lên. Các ảnh đã tải sẽ được xóa.",
  database: "Không thể tạo khách sạn. Các tài nguyên đã tạo sẽ được xóa.",
  embedding:
    "Không thể tạo dữ liệu tìm kiếm cho khách sạn. Các tài nguyên đã tạo sẽ được xóa.",
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
  photos: File[],
  fieldKey: string,
): Promise<{ status: "error"; fieldErrors: Record<string, string[]> } | null> {
  if (photos.length === 0) {
    return {
      status: "error",
      fieldErrors: { [fieldKey]: ["Cần ít nhất 1 ảnh."] },
    };
  }
  if (photos.length > MAX_PHOTOS) {
    return {
      status: "error",
      fieldErrors: { [fieldKey]: [`Tối đa ${MAX_PHOTOS} ảnh.`] },
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
          [fieldKey]: ["Ảnh phải là PNG/JPG hợp lệ và dưới 5MB."],
        },
      };
    }
  }
  return null;
}

async function createHotelWithUniqueSlug(
  input: CreateHotelInput & {
    providerProfileId: string;
    images: UploadedImage[];
    rooms: (RoomDraftInput & { images: UploadedImage[] })[];
  },
): Promise<Hotel> {
  const baseSlug = slugify(input.name) || "hotel";

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const slug =
      attempt === 0 ? baseSlug : `${baseSlug}-${randomUUID().slice(0, 8)}`;

    try {
      return await hotelRepo.create({ ...input, slug });
    } catch (error) {
      if (
        !isUniqueConstraintError(error) ||
        attempt === MAX_SLUG_ATTEMPTS - 1
      ) {
        throw error;
      }
    }
  }

  throw new Error("Không thể tạo slug duy nhất cho khách sạn.");
}

async function rollbackHotelCreation(input: {
  uploadedImages: UploadedImage[];
  createdHotelId: string | null;
  embeddingUpsertAttempted: boolean;
}): Promise<{ resource: string; reason: unknown }[]> {
  const failures: { resource: string; reason: unknown }[] = [];

  if (input.embeddingUpsertAttempted && input.createdHotelId) {
    try {
      await retryCleanup(() => deleteHotelEmbedding(input.createdHotelId!));
    } catch (reason) {
      failures.push({ resource: `pinecone:${input.createdHotelId}`, reason });
    }
  }

  if (input.createdHotelId) {
    try {
      await retryCleanup(() => hotelRepo.remove(input.createdHotelId!));
    } catch (reason) {
      failures.push({ resource: `hotel:${input.createdHotelId}`, reason });
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

export async function createHotelAction(
  _prevState: CreateHotelActionState,
  formData: FormData,
): Promise<CreateHotelActionState> {
  const uploadedImages: UploadedImage[] = [];
  let createdHotelId: string | null = null;
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
        formError: "Chỉ tài khoản đối tác mới có thể tạo khách sạn.",
      };
    }

    const providerProfile =
      await providerProfileRepo.findApprovedByUserIdAndBusinessType(
        session.user.id,
        "hotel",
      );
    if (!providerProfile) {
      return {
        status: "error",
        formError:
          "Tài khoản phải đang hoạt động và có hồ sơ doanh nghiệp loại Khách sạn đã được duyệt.",
      };
    }

    stage = "validation";
    const rawRooms = parseJsonField<
      Array<{
        name: unknown;
        description: unknown;
        capacity: unknown;
        quantity: unknown;
        basePrice: unknown;
        amenities: unknown;
      }>
    >(formData, "rooms", []);

    const parsed = createHotelSchema.safeParse({
      name: formData.get("name"),
      provinceId: formData.get("provinceId"),
      address: formData.get("address"),
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
      description: formData.get("description"),
      amenities: parseJsonField<string[]>(formData, "amenities", []),
      rooms: rawRooms,
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

    const hotelPhotos = formData
      .getAll("photos")
      .filter((file): file is File => file instanceof File && file.size > 0);
    const hotelPhotoError = await validatePhotos(hotelPhotos, "photos");
    if (hotelPhotoError) return hotelPhotoError;

    const roomPhotosList: File[][] = parsed.data.rooms.map((_, index) =>
      formData
        .getAll(`room-photos-${index}`)
        .filter((file): file is File => file instanceof File && file.size > 0),
    );
    for (let index = 0; index < roomPhotosList.length; index += 1) {
      const roomPhotoError = await validatePhotos(
        roomPhotosList[index],
        `room-photos-${index}`,
      );
      if (roomPhotoError) return roomPhotoError;
    }

    const province = await provinceRepo.findById(parsed.data.provinceId);
    if (!province) {
      return {
        status: "error",
        fieldErrors: { provinceId: ["Tỉnh/thành đã chọn không tồn tại."] },
      };
    }

    stage = "upload";
    const hotelUploadResults = await Promise.allSettled(
      hotelPhotos.map((photo) =>
        uploadImage(photo, `hotels/${providerProfile.id}`),
      ),
    );
    const roomUploadResultsList = await Promise.all(
      roomPhotosList.map((photos, index) =>
        Promise.allSettled(
          photos.map((photo) =>
            uploadImage(photo, `hotels/${providerProfile.id}/rooms/${index}`),
          ),
        ),
      ),
    );

    const hotelImages: UploadedImage[] = [];
    for (const result of hotelUploadResults) {
      if (result.status === "fulfilled") {
        hotelImages.push({
          url: result.value.url,
          fileId: result.value.fileId,
        });
        uploadedImages.push({
          url: result.value.url,
          fileId: result.value.fileId,
        });
      }
    }

    const roomImages: UploadedImage[][] = roomUploadResultsList.map(
      (results) => {
        const images: UploadedImage[] = [];
        for (const result of results) {
          if (result.status === "fulfilled") {
            images.push({ url: result.value.url, fileId: result.value.fileId });
            uploadedImages.push({
              url: result.value.url,
              fileId: result.value.fileId,
            });
          }
        }
        return images;
      },
    );

    const allUploadResults = [
      ...hotelUploadResults,
      ...roomUploadResultsList.flat(),
    ];
    const uploadFailure = allUploadResults.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (uploadFailure) throw uploadFailure.reason;

    stage = "database";
    const hotel = await createHotelWithUniqueSlug({
      ...parsed.data,
      providerProfileId: providerProfile.id,
      images: hotelImages,
      rooms: parsed.data.rooms.map((room, index) => ({
        ...room,
        images: roomImages[index] ?? [],
      })),
    });
    createdHotelId = hotel.id;

    stage = "embedding";
    const embeddingText = [
      parsed.data.name,
      parsed.data.description,
      province.fullName,
      parsed.data.address,
      parsed.data.amenities.join(", "),
      parsed.data.rooms.map((room) => room.name).join(", "),
      parsed.data.rooms.map((room) => room.description).join(", "),
    ]
      .filter(Boolean)
      .join("\n");

    const vector = await embedText(embeddingText);
    embeddingUpsertAttempted = true;
    await upsertHotelEmbedding(hotel.id, vector, {
      name: parsed.data.name,
      provinceId: parsed.data.provinceId,
      status: hotel.status,
      providerProfileId: providerProfile.id,
    });
  } catch (error) {
    const cleanupFailures = await rollbackHotelCreation({
      uploadedImages,
      createdHotelId,
      embeddingUpsertAttempted,
    });

    console.error("Tạo khách sạn thất bại", {
      stage,
      createdHotelId,
      error,
      cleanupFailures,
    });

    return {
      status: "error",
      formError: STAGE_ERROR_MESSAGES[stage],
    };
  }

  revalidatePath("/provider/hotels");
  redirect("/provider/hotels");
}
