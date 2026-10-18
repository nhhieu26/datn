"use client";

import type { Province, Tag } from "@/generated/prisma/client";
import {
  startTransition,
  useActionState,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  useMultiStepForm,
  type StepDefinition,
} from "@/shared/components/multi-step-form";
import { PrelineStepper } from "@/shared/components/preline-stepper";
import {
  createHotelAction,
  updateHotelAction,
} from "@/features/provider/hotels/actions";
import { LocationPicker, type LatLng } from "@/shared/components/location-picker";
import { HotelDetailPreview } from "./hotel-detail-preview";
import { HotelIcon } from "./hotel-icon";

const INITIAL_ACTION_STATE = { status: "idle" as const };

const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_PHOTOS = 5;

const steps: StepDefinition[] = [
  { id: 1, title: "Thông tin cơ bản", subtitle: "Nội dung chính" },
  { id: 2, title: "Hình ảnh", subtitle: "Tối đa 5 ảnh" },
  { id: 3, title: "Danh sách phòng", subtitle: "Loại phòng & giá" },
  { id: 4, title: "Xem trước", subtitle: "Trang chi tiết khách sạn" },
];

export type HotelPhoto =
  | { kind: "new"; file: File; previewUrl: string }
  | { kind: "existing"; fileId: string; previewUrl: string };

export type RoomDraft = {
  id?: string;
  bookedCount?: number;
  name: string;
  description: string;
  capacity: string;
  quantity: string;
  basePrice: string;
  amenities: string[];
  photos: HotelPhoto[];
};

export type HotelFormState = {
  name: string;
  provinceId: string;
  address: string;
  location: LatLng | null;
  description: string;
  amenities: string[];
  tagIds: string[];
  photos: HotelPhoto[];
  rooms: RoomDraft[];
};

const inputClass =
  "block w-full rounded-lg border-layer-line bg-layer px-3 py-2 text-foreground placeholder:text-muted-foreground-1 focus:border-primary-focus focus:ring-primary-focus disabled:pointer-events-none disabled:opacity-50 sm:text-sm";
const selectClass = `${inputClass} pe-9`;
const textareaClass = `${inputClass} resize-y py-2.5 leading-relaxed`;
const labelClass = "mb-2 block text-sm font-medium text-foreground";
const requiredMark = <span className="text-red-500">*</span>;

const layerButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer px-3 py-2 text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";
const primaryButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";
const dashedButtonClass =
  "inline-flex w-full items-center justify-center gap-x-2 rounded-lg border border-dashed border-layer-line bg-layer px-3 py-2 text-sm font-medium text-muted-foreground-1 hover:border-primary-line hover:text-primary focus:outline-hidden";
const destructiveTextButtonClass =
  "inline-flex items-center gap-x-1.5 rounded-lg text-sm font-medium text-red-600 hover:text-red-800 focus:text-red-800 focus:outline-hidden";
const countBadgeClass =
  "inline-flex items-center rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-surface-foreground";

function Card({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
      <div className="flex items-center justify-between gap-x-3 border-b border-card-divider px-4 py-3 md:px-5">
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground-1">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="space-y-5 p-4 md:p-5">{children}</div>
    </div>
  );
}

function createInitialRoom(): RoomDraft {
  return {
    name: "",
    description: "",
    capacity: "2",
    quantity: "1",
    basePrice: "",
    amenities: [],
    photos: [],
  };
}

function createInitialState(provinces: Province[]): HotelFormState {
  return {
    name: "",
    provinceId: provinces[0]?.id ?? "",
    address: "",
    location: null,
    description: "",
    amenities: [],
    tagIds: [],
    photos: [],
    rooms: [createInitialRoom()],
  };
}

function TagList({
  label,
  items,
  placeholder,
  onAdd,
  onRemove,
}: {
  label: string;
  items: string[];
  placeholder: string;
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    const value = draft.trim();
    if (!value) return;
    onAdd(value);
    setDraft("");
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      {items.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {items.map((item, index) => (
            <span
              className="inline-flex items-center gap-x-1.5 rounded-full bg-surface py-1.5 ps-3 pe-2 text-xs font-medium text-surface-foreground"
              key={`${item}-${index}`}
            >
              {item}
              <button
                aria-label={`Xóa ${item}`}
                className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground-1 hover:bg-surface-hover hover:text-foreground focus:outline-hidden"
                onClick={() => onRemove(index)}
                type="button"
              >
                <HotelIcon className="size-3" name="x" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex gap-x-2">
        <input
          className={inputClass}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          type="text"
          value={draft}
        />
        <button
          className={`${layerButtonClass} shrink-0`}
          onClick={submit}
          type="button"
        >
          <HotelIcon name="plus" />
          Thêm
        </button>
      </div>
    </div>
  );
}

function PhotoPicker({
  photos,
  onSelect,
  onRemove,
  altPrefix,
}: {
  photos: HotelPhoto[];
  onSelect: (files: FileList | null) => void;
  onRemove: (index: number) => void;
  altPrefix: string;
}) {
  return (
    <>
      {photos.length < MAX_PHOTOS ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-layer-line bg-layer p-8 text-center hover:border-primary-line">
          <span className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground-2">
            <HotelIcon className="size-5" name="upload" />
          </span>
          <span className="mt-3 text-sm text-foreground">
            <span className="font-medium text-primary">Chọn ảnh tải lên</span>{" "}
            hoặc kéo thả vào đây
          </span>
          <span className="mt-1 text-xs text-muted-foreground-1">
            Còn lại {MAX_PHOTOS - photos.length} ảnh
          </span>
          <input
            accept="image/png,image/jpeg"
            className="hidden"
            multiple
            onChange={(event) => onSelect(event.target.files)}
            type="file"
          />
        </label>
      ) : null}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {photos.map((photo, index) => (
            <div
              className="group relative aspect-square overflow-hidden rounded-lg border border-layer-line"
              key={photo.previewUrl}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={`${altPrefix} ${index + 1}`}
                className="size-full object-cover"
                src={photo.previewUrl}
              />
              {index === 0 ? (
                <span className="absolute start-1.5 bottom-1.5 inline-flex rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                  Ảnh bìa
                </span>
              ) : null}
              <button
                aria-label={`Xóa ảnh ${index + 1}`}
                className="absolute end-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-full border border-layer-line bg-layer text-red-600 opacity-0 shadow-2xs group-hover:opacity-100 hover:bg-layer-hover focus:opacity-100 focus:outline-hidden"
                onClick={() => onRemove(index)}
                type="button"
              >
                <HotelIcon className="size-3.5" name="x" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

export function HotelForm({
  provinces,
  tags,
  mode = "create",
  hotelId,
  initialValues,
}: {
  provinces: Province[];
  tags: Tag[];
  mode?: "create" | "edit";
  hotelId?: string;
  initialValues?: HotelFormState;
}) {
  const [form, setForm] = useState<HotelFormState>(
    () => initialValues ?? createInitialState(provinces)
  );
  const { currentStep, goTo, next, prev, isFirst, isLast } =
    useMultiStepForm(steps.length);
  const [actionState, formAction, isPending] = useActionState(
    mode === "edit" ? updateHotelAction.bind(null, hotelId!) : createHotelAction,
    INITIAL_ACTION_STATE
  );

  const update = <K extends keyof HotelFormState>(
    key: K,
    value: HotelFormState[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const selectedProvince = useMemo(
    () => provinces.find((province) => province.id === form.provinceId),
    [provinces, form.provinceId]
  );

  const toggleTag = (tagId: string) => {
    update(
      "tagIds",
      form.tagIds.includes(tagId)
        ? form.tagIds.filter((id) => id !== tagId)
        : [...form.tagIds, tagId]
    );
  };

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - form.photos.length;
    const nextPhotos = Array.from(files)
      .slice(0, remaining)
      .map((file) => ({
        kind: "new" as const,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    update("photos", [...form.photos, ...nextPhotos]);
  };

  const removePhoto = (index: number) =>
    update(
      "photos",
      form.photos.filter((_, i) => i !== index)
    );

  const updateRoom = <K extends keyof RoomDraft>(
    index: number,
    key: K,
    value: RoomDraft[K]
  ) =>
    update(
      "rooms",
      form.rooms.map((room, i) =>
        i === index ? { ...room, [key]: value } : room
      )
    );

  const addRoom = () => update("rooms", [...form.rooms, createInitialRoom()]);
  const removeRoom = (index: number) =>
    update(
      "rooms",
      form.rooms.filter((_, i) => i !== index)
    );

  const handleRoomPhotoSelect = (index: number, files: FileList | null) => {
    if (!files) return;
    const room = form.rooms[index];
    const remaining = MAX_PHOTOS - room.photos.length;
    const nextPhotos = Array.from(files)
      .slice(0, remaining)
      .map((file) => ({
        kind: "new" as const,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    updateRoom(index, "photos", [...room.photos, ...nextPhotos]);
  };

  const removeRoomPhoto = (roomIndex: number, photoIndex: number) => {
    const room = form.rooms[roomIndex];
    updateRoom(
      roomIndex,
      "photos",
      room.photos.filter((_, i) => i !== photoIndex)
    );
  };

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("provinceId", form.provinceId);
    fd.append("address", form.address);
    if (form.location) {
      fd.append("latitude", String(form.location.lat));
      fd.append("longitude", String(form.location.lng));
    }
    fd.append("description", form.description);
    fd.append("amenities", JSON.stringify(form.amenities));
    fd.append("tagIds", JSON.stringify(form.tagIds));
    fd.append(
      "rooms",
      JSON.stringify(
        form.rooms.map((room) => ({
          id: room.id,
          name: room.name,
          description: room.description,
          capacity: room.capacity,
          quantity: room.quantity,
          basePrice: room.basePrice,
          amenities: room.amenities,
        }))
      )
    );
    fd.append(
      "existingImageIds",
      JSON.stringify(
        form.photos.flatMap((photo) =>
          photo.kind === "existing" ? [photo.fileId] : []
        )
      )
    );
    form.photos.forEach((photo) => {
      if (photo.kind === "new") fd.append("photos", photo.file);
    });
    form.rooms.forEach((room, index) => {
      fd.append(
        `room-existing-photos-${index}`,
        JSON.stringify(
          room.photos.flatMap((photo) =>
            photo.kind === "existing" ? [photo.fileId] : []
          )
        )
      );
      room.photos.forEach((photo) => {
        if (photo.kind === "new")
          fd.append(`room-photos-${index}`, photo.file);
      });
    });

    startTransition(() => {
      formAction(fd);
    });
  };

  const isPreviewStep = currentStep === steps.length;
  const selectedTagNames = tags
    .filter((tag) => form.tagIds.includes(tag.id))
    .map((tag) => tag.name);

  const lastLabel =
    mode === "edit"
      ? isPending
        ? "Đang lưu..."
        : "Lưu thay đổi"
      : isPending
        ? "Đang tạo khách sạn..."
        : "Hoàn tất & Xuất bản Khách sạn";

  return (
    <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="grid gap-3 md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {mode === "edit" ? "Chỉnh sửa Khách sạn" : "Tạo Khách Sạn Mới"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
            {mode === "edit"
              ? "Cập nhật thông tin, hình ảnh và danh sách phòng của khách sạn."
              : "Nhập thông tin chi tiết để giới thiệu khách sạn của bạn tới khách du lịch."}
          </p>
        </div>
        <Link
          className={`${layerButtonClass} self-start md:self-auto`}
          href="/provider/hotels"
        >
          <HotelIcon name="chevronLeft" />
          Danh sách khách sạn
        </Link>
      </div>

      {actionState.status === "error" &&
      (actionState.formError || actionState.fieldErrors) ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <div className="flex gap-x-3">
            <HotelIcon className="mt-0.5 size-4" name="alert" />
            <div className="space-y-1">
              {actionState.formError ? (
                <h3 className="font-semibold">{actionState.formError}</h3>
              ) : null}
              {actionState.fieldErrors ? (
                <ul className="list-inside list-disc space-y-1">
                  {Object.entries(actionState.fieldErrors).map(
                    ([field, messages]) => (
                      <li key={field}>{messages.join(", ")}</li>
                    )
                  )}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-card-line bg-card p-4 shadow-2xs md:p-5">
        <PrelineStepper
          currentStep={currentStep}
          onStepClick={goTo}
          steps={steps}
        />
      </div>

      <div className="space-y-4 sm:space-y-6">
        {currentStep === 1 ? (
          <>
            <Card title="Thông tin cơ bản & Địa điểm">
              <div>
                <label className={labelClass} htmlFor="name">
                  Tên khách sạn {requiredMark}
                </label>
                <input
                  className={inputClass}
                  id="name"
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="VD: Khách sạn Sea View Đà Nẵng"
                  type="text"
                  value={form.name}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="provinceId">
                    Tỉnh / Thành {requiredMark}
                  </label>
                  <select
                    className={selectClass}
                    id="provinceId"
                    onChange={(event) =>
                      update("provinceId", event.target.value)
                    }
                    value={form.provinceId}
                  >
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="address">
                    Địa chỉ {requiredMark}
                  </label>
                  <input
                    className={inputClass}
                    id="address"
                    onChange={(event) =>
                      update("address", event.target.value)
                    }
                    placeholder="VD: 123 Võ Nguyên Giáp, Sơn Trà"
                    type="text"
                    value={form.address}
                  />
                </div>
              </div>

              <LocationPicker
                onChange={(value) => update("location", value)}
                value={form.location}
                variant="preline"
              />

              <div>
                <label className={labelClass}>Thẻ / Tag phân loại</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const selected = form.tagIds.includes(tag.id);
                    return (
                      <button
                        aria-pressed={selected}
                        className={`inline-flex items-center gap-x-1.5 rounded-full border px-3 py-1.5 text-xs font-medium focus:outline-hidden ${
                          selected
                            ? "border-primary-line bg-primary-50 text-primary-700"
                            : "border-layer-line bg-layer text-layer-foreground hover:bg-layer-hover"
                        }`}
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        type="button"
                      >
                        {selected ? (
                          <HotelIcon className="size-3" name="tick" />
                        ) : null}
                        {tag.name}
                      </button>
                    );
                  })}
                  {tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground-1">
                      Chưa có tag nào trong hệ thống.
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    className="block text-sm font-medium text-foreground"
                    htmlFor="description"
                  >
                    Mô tả chi tiết khách sạn
                  </label>
                  <span className="text-xs text-muted-foreground-1">
                    {form.description.length} / {MAX_DESCRIPTION_LENGTH} ký
                    tự
                  </span>
                </div>
                <textarea
                  className={textareaClass}
                  id="description"
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                  placeholder="Mô tả không gian, tiện nghi, view, trải nghiệm..."
                  rows={6}
                  value={form.description}
                />
              </div>
            </Card>

            <Card title="Tiện ích khách sạn">
              <TagList
                items={form.amenities}
                label="Danh sách tiện ích"
                onAdd={(value) =>
                  update("amenities", [...form.amenities, value])
                }
                onRemove={(index) =>
                  update(
                    "amenities",
                    form.amenities.filter((_, i) => i !== index)
                  )
                }
                placeholder="VD: Hồ bơi, Wifi miễn phí, Bãi đỗ xe..."
              />
            </Card>
          </>
        ) : null}

        {currentStep === 2 ? (
          <Card
            action={
              <span className={countBadgeClass}>
                {form.photos.length}/{MAX_PHOTOS} ảnh
              </span>
            }
            description="Ảnh đầu tiên sẽ được dùng làm ảnh bìa. Hỗ trợ PNG, JPG."
            title="Hình ảnh khách sạn"
          >
            <PhotoPicker
              altPrefix="Ảnh khách sạn"
              onRemove={removePhoto}
              onSelect={handlePhotoSelect}
              photos={form.photos}
            />
          </Card>
        ) : null}

        {currentStep === 3 ? (
          <>
            {form.rooms.map((room, index) => (
              <Card
                action={
                  room.bookedCount ? (
                    <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-800">
                      Đang có khách đặt
                    </span>
                  ) : form.rooms.length > 1 ? (
                    <button
                      className={destructiveTextButtonClass}
                      onClick={() => removeRoom(index)}
                      type="button"
                    >
                      <HotelIcon className="size-3.5" name="trash" />
                      Xóa phòng này
                    </button>
                  ) : null
                }
                key={index}
                title={`Loại phòng ${index + 1}${room.name ? ` · ${room.name}` : ""}`}
              >
                <div>
                  <label className={labelClass}>
                    Tên loại phòng {requiredMark}
                  </label>
                  <input
                    className={inputClass}
                    onChange={(event) =>
                      updateRoom(index, "name", event.target.value)
                    }
                    placeholder="VD: Phòng Deluxe hướng biển"
                    type="text"
                    value={room.name}
                  />
                </div>

                <div>
                  <label className={labelClass}>Mô tả phòng</label>
                  <textarea
                    className={textareaClass}
                    onChange={(event) =>
                      updateRoom(index, "description", event.target.value)
                    }
                    placeholder="Mô tả nội thất, view, diện tích..."
                    rows={3}
                    value={room.description}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className={labelClass}>
                      Sức chứa (khách) {requiredMark}
                    </label>
                    <input
                      className={inputClass}
                      min={1}
                      onChange={(event) =>
                        updateRoom(index, "capacity", event.target.value)
                      }
                      type="number"
                      value={room.capacity}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Số lượng phòng {requiredMark}
                    </label>
                    <input
                      className={inputClass}
                      min={1}
                      onChange={(event) =>
                        updateRoom(index, "quantity", event.target.value)
                      }
                      type="number"
                      value={room.quantity}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Giá / đêm {requiredMark}
                    </label>
                    <div className="relative">
                      <input
                        className={`${inputClass} pe-16`}
                        min={0}
                        onChange={(event) =>
                          updateRoom(index, "basePrice", event.target.value)
                        }
                        placeholder="VD: 800000"
                        type="number"
                        value={room.basePrice}
                      />
                      <div className="pointer-events-none absolute inset-y-0 end-0 z-20 flex items-center pe-4">
                        <span className="text-sm text-muted-foreground-1">
                          VND
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <TagList
                  items={room.amenities}
                  label="Tiện ích phòng"
                  onAdd={(value) =>
                    updateRoom(index, "amenities", [...room.amenities, value])
                  }
                  onRemove={(amenityIndex) =>
                    updateRoom(
                      index,
                      "amenities",
                      room.amenities.filter((_, i) => i !== amenityIndex)
                    )
                  }
                  placeholder="VD: Điều hòa, Minibar, Bồn tắm..."
                />

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="block text-sm font-medium text-foreground">
                      Ảnh phòng
                    </span>
                    <span className={countBadgeClass}>
                      {room.photos.length}/{MAX_PHOTOS} ảnh
                    </span>
                  </div>
                  <div className="space-y-3">
                    <PhotoPicker
                      altPrefix={`Ảnh ${room.name || "phòng"}`}
                      onRemove={(photoIndex) =>
                        removeRoomPhoto(index, photoIndex)
                      }
                      onSelect={(files) => handleRoomPhotoSelect(index, files)}
                      photos={room.photos}
                    />
                  </div>
                </div>
              </Card>
            ))}
            <button
              className={dashedButtonClass}
              onClick={addRoom}
              type="button"
            >
              <HotelIcon name="plus" />
              Thêm loại phòng mới
            </button>
          </>
        ) : null}

        {isPreviewStep ? (
          <HotelDetailPreview
            form={form}
            provinceName={selectedProvince?.name}
            tagNames={selectedTagNames}
          />
        ) : null}

        <div className="flex items-center justify-between gap-x-2 rounded-xl border border-card-line bg-card px-4 py-3 shadow-2xs md:px-5">
          {isFirst ? (
            <Link className={layerButtonClass} href="/provider/hotels">
              Hủy thao tác
            </Link>
          ) : (
            <button className={layerButtonClass} onClick={prev} type="button">
              <HotelIcon name="chevronLeft" />
              Quay lại bước trước
            </button>
          )}
          <button
            className={primaryButtonClass}
            disabled={isLast && isPending}
            onClick={isLast ? handleSubmit : next}
            type="button"
          >
            {isLast && isPending ? (
              <span
                aria-label="loading"
                className="inline-block size-4 animate-spin rounded-full border-3 border-current border-t-transparent"
                role="status"
              />
            ) : null}
            {isLast ? lastLabel : "Tiếp tục"}
            {isLast ? null : <HotelIcon name="chevronRight" />}
          </button>
        </div>
      </div>
    </div>
  );
}
