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
  updateTourSchema,
  tourRepo,
  type CreateTourInput,
  type Tour,
  type TourWithRelations,
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
const TOUR_DELETE_GRACE_DAYS = 30;

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

function parseTourFormData(
  formData: FormData,
  schema: typeof createTourSchema | typeof updateTourSchema = createTourSchema,
) {
  return schema.safeParse({
    title: formData.get("title"),
    provinceId: formData.get("provinceId"),
    tagIds: parseJsonField<string[]>(formData, "tagIds", []),
    durationDays: formData.get("durationDays"),
    durationNights: formData.get("durationNights"),
    description: formData.get("description"),
    includeServices: parseJsonField<string[]>(formData, "includeServices", []),
    excludeServices: parseJsonField<string[]>(formData, "excludeServices", []),
    itinerary: parseJsonField(formData, "itinerary", []),
    basePrice: formData.get("basePrice"),
    departures: parseJsonField(formData, "departures", []),
  });
}

function hasPastDeparture(
  departures: { departureDate: Date }[],
  now: Date,
): boolean {
  return departures.some((departure) => departure.departureDate <= now);
}

const PAST_DEPARTURE_ERROR = "Ngày khởi hành phải ở tương lai.";

function buildEmbeddingText(
  data: Pick<
    CreateTourInput,
    "title" | "description" | "itinerary" | "includeServices"
  >,
  provinceName: string,
  tags: { name: string }[],
): string {
  return [
    data.title,
    data.description,
    provinceName,
    tags.map((tag) => tag.name).join(", "),
    data.itinerary.map((day) => day.title).join(", "),
    data.includeServices.join(", "),
  ]
    .filter(Boolean)
    .join("\n");
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

async function arePhotosValid(photos: File[]): Promise<boolean> {
  for (const photo of photos) {
    if (
      !ALLOWED_PHOTO_TYPES.includes(photo.type) ||
      photo.size > MAX_PHOTO_SIZE ||
      !(await hasValidImageSignature(photo))
    ) {
      return false;
    }
  }
  return true;
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
    const parsed = parseTourFormData(formData);

    if (!parsed.success) {
      return {
        status: "error",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }

    if (hasPastDeparture(parsed.data.departures, new Date())) {
      return {
        status: "error",
        fieldErrors: { departures: [PAST_DEPARTURE_ERROR] },
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
    if (!(await arePhotosValid(photos))) {
      return {
        status: "error",
        fieldErrors: { photos: ["Ảnh phải là PNG/JPG hợp lệ và dưới 5MB."] },
      };
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
    const vector = await embedText(
      buildEmbeddingText(parsed.data, province.fullName, tags),
    );
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
    const parsed = parseTourFormData(formData);

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
    const vector = await embedText(
      buildEmbeddingText(parsed.data, province.fullName, tags),
    );
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

export type UpdateTourActionState = ActionState;

function parseStoredImages(images: unknown): UploadedImage[] {
  if (!Array.isArray(images)) return [];
  return images.filter(
    (image): image is UploadedImage =>
      typeof image?.url === "string" && typeof image?.fileId === "string",
  );
}

export async function updateTourAction(
  tourId: string,
  _prevState: UpdateTourActionState,
  formData: FormData,
): Promise<UpdateTourActionState> {
  const uploadedImages: UploadedImage[] = [];
  let stage: CreationStage = "authorization";
  let slug: string;
  let removedImages: UploadedImage[];

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error", formError: "Vui lòng đăng nhập lại." };
    }
    if (session.user.role !== "provider") {
      return {
        status: "error",
        formError: "Chỉ tài khoản đối tác mới có thể sửa tour.",
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

    const tour = await tourRepo.findByIdForProvider(
      tourId,
      providerProfile.id,
    );
    if (!tour) {
      return { status: "error", formError: "Không tìm thấy tour." };
    }
    if (tour.deleteScheduledAt) {
      return {
        status: "error",
        formError: "Tour đã dừng, không thể chỉnh sửa.",
      };
    }
    slug = tour.slug;

    stage = "validation";
    const parsed = parseTourFormData(formData, updateTourSchema);
    if (!parsed.success) {
      return {
        status: "error",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }

    const storedImages = parseStoredImages(tour.images);
    const keptFileIds = new Set(
      parseJsonField<string[]>(formData, "existingImageIds", []),
    );
    const keptImages = storedImages.filter((image) =>
      keptFileIds.has(image.fileId),
    );
    removedImages = storedImages.filter(
      (image) => !keptFileIds.has(image.fileId),
    );

    const photos = formData.getAll("photos").filter((file): file is File => {
      return file instanceof File && file.size > 0;
    });
    const totalPhotos = keptImages.length + photos.length;
    if (totalPhotos === 0) {
      return {
        status: "error",
        fieldErrors: { photos: ["Cần ít nhất 1 ảnh cho tour."] },
      };
    }
    if (totalPhotos > MAX_PHOTOS) {
      return {
        status: "error",
        fieldErrors: { photos: [`Tối đa ${MAX_PHOTOS} ảnh.`] },
      };
    }
    if (!(await arePhotosValid(photos))) {
      return {
        status: "error",
        fieldErrors: { photos: ["Ảnh phải là PNG/JPG hợp lệ và dưới 5MB."] },
      };
    }

    // Đợt đã diễn ra (bị ẩn khỏi form) hoặc đã có người đặt thì giữ nguyên, bỏ qua dữ liệu gửi lên
    const now = new Date();
    const existingDepartures = new Map(
      tour.departures.map((departure) => [departure.id, departure]),
    );
    const isLocked = (departure: { departureDate: Date; bookedSlots: number }) =>
      departure.departureDate <= now || departure.bookedSlots > 0;
    const submittedDepartureIds = new Set<string>();
    const departures: typeof parsed.data.departures = [];
    for (const departure of parsed.data.departures) {
      if (departure.id) {
        const existing = existingDepartures.get(departure.id);
        if (!existing) {
          return {
            status: "error",
            fieldErrors: { departures: ["Đợt khởi hành không hợp lệ."] },
          };
        }
        submittedDepartureIds.add(departure.id);
        if (isLocked(existing)) continue;
      }
      departures.push(departure);
    }
    if (hasPastDeparture(departures, now)) {
      return {
        status: "error",
        fieldErrors: { departures: [PAST_DEPARTURE_ERROR] },
      };
    }
    const removedDepartureIds = tour.departures
      .filter(
        (departure) =>
          !isLocked(departure) && !submittedDepartureIds.has(departure.id),
      )
      .map((departure) => departure.id);

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
    const updatedTour = await tourRepo.update(tour.id, {
      ...parsed.data,
      departures,
      tagIds,
      images: [...keptImages, ...uploadedImages],
      removedDepartureIds,
    });

    try {
      const vector = await embedText(
        buildEmbeddingText(parsed.data, province.fullName, tags),
      );
      await upsertTourEmbedding(updatedTour.id, vector, {
        title: parsed.data.title,
        provinceId: parsed.data.provinceId,
        tagIds,
        status: updatedTour.status,
        providerProfileId: providerProfile.id,
      });
    } catch (error) {
      console.error("Cập nhật embedding tour thất bại", {
        tourId: updatedTour.id,
        error,
      });
    }
  } catch (error) {
    const cleanupResults = await Promise.allSettled(
      uploadedImages.map((image) =>
        retryCleanup(() => deleteImage(image.fileId)),
      ),
    );

    console.error("Cập nhật tour thất bại", {
      stage,
      tourId,
      error,
      cleanupFailures: cleanupResults.filter(
        (result) => result.status === "rejected",
      ),
    });

    return {
      status: "error",
      formError:
        stage === "upload"
          ? STAGE_ERROR_MESSAGES.upload
          : "Không thể cập nhật tour. Vui lòng thử lại.",
    };
  }

  // Ảnh tạo từ link (seed) có fileId trùng url, không nằm trên ImageKit.
  const imageCleanupResults = await Promise.allSettled(
    removedImages
      .filter((image) => image.fileId !== image.url)
      .map((image) => retryCleanup(() => deleteImage(image.fileId))),
  );
  imageCleanupResults.forEach((result) => {
    if (result.status === "rejected") {
      console.error("Xóa ảnh tour cũ thất bại", { tourId, error: result.reason });
    }
  });

  revalidatePath("/provider/tours");
  revalidatePath(`/tours/${slug}`);
  redirect("/provider/tours");
}

type ProviderTourResult =
  | { error: ActionState }
  | { tour: TourWithRelations; providerProfileId: string };

async function findProviderTour(
  tourId: string,
  verb: string,
): Promise<ProviderTourResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: { status: "error", formError: "Vui lòng đăng nhập lại." } };
  }
  if (session.user.role !== "provider") {
    return {
      error: {
        status: "error",
        formError: `Chỉ tài khoản đối tác mới có thể ${verb} tour.`,
      },
    };
  }

  const providerProfile =
    await providerProfileRepo.findApprovedByUserIdAndBusinessType(
      session.user.id,
      "tour",
    );
  if (!providerProfile) {
    return {
      error: {
        status: "error",
        formError:
          "Tài khoản phải đang hoạt động và có hồ sơ doanh nghiệp loại Tour đã được duyệt.",
      },
    };
  }

  const tour = await tourRepo.findByIdForProvider(tourId, providerProfile.id);
  if (!tour) {
    return { error: { status: "error", formError: "Không tìm thấy tour." } };
  }
  return { tour, providerProfileId: providerProfile.id };
}

function revalidateTourPages(slug: string) {
  revalidatePath("/provider/tours");
  revalidatePath(`/tours/${slug}`);
  revalidatePath("/explore");
  revalidatePath("/");
}

export async function deleteTourAction(tourId: string): Promise<ActionState> {
  const found = await findProviderTour(tourId, "xóa");
  if ("error" in found) return found.error;
  const { tour, providerProfileId } = found;

  // Không xóa ngay: dừng bán, booking đang có vẫn xử lý bình thường; cron xóa mềm khi tới hạn
  const deleteAt = new Date(
    Date.now() + TOUR_DELETE_GRACE_DAYS * 24 * 60 * 60 * 1000,
  );
  try {
    const count = await tourRepo.scheduleDeletion(
      tour.id,
      providerProfileId,
      deleteAt,
    );
    if (count === 0) {
      return { status: "error", formError: "Tour đã được dừng trước đó." };
    }
  } catch (error) {
    console.error("Xóa tour thất bại", { tourId, error });
    return {
      status: "error",
      formError: "Không thể xóa tour. Vui lòng thử lại.",
    };
  }

  try {
    await deleteTourEmbedding(tour.id);
  } catch (error) {
    console.error("Xóa embedding tour thất bại", { tourId, error });
  }

  revalidateTourPages(tour.slug);
  return { status: "success" };
}

export async function restoreTourAction(tourId: string): Promise<ActionState> {
  const found = await findProviderTour(tourId, "khôi phục");
  if ("error" in found) return found.error;
  const { tour, providerProfileId } = found;

  try {
    const count = await tourRepo.cancelDeletion(tour.id, providerProfileId);
    if (count === 0) {
      return { status: "error", formError: "Tour không ở trạng thái đã dừng." };
    }
  } catch (error) {
    console.error("Khôi phục tour thất bại", { tourId, error });
    return {
      status: "error",
      formError: "Không thể khôi phục tour. Vui lòng thử lại.",
    };
  }

  // Embedding đã bị xóa khi dừng tour, tạo lại để tour xuất hiện trong tìm kiếm
  try {
    const tagIds = tour.tags.map((tourTag) => tourTag.tagId);
    const vector = await embedText(
      buildEmbeddingText(
        {
          title: tour.title,
          description: tour.description ?? "",
          itinerary: Array.isArray(tour.itinerary)
            ? (tour.itinerary as CreateTourInput["itinerary"])
            : [],
          includeServices: tour.includeServices,
        },
        tour.province.fullName,
        tour.tags.map((tourTag) => tourTag.tag),
      ),
    );
    await upsertTourEmbedding(tour.id, vector, {
      title: tour.title,
      provinceId: tour.provinceId,
      tagIds,
      status: "published",
      providerProfileId,
    });
  } catch (error) {
    console.error("Tạo lại embedding tour thất bại", { tourId, error });
  }

  revalidateTourPages(tour.slug);
  return { status: "success" };
}
