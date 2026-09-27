"use client";

import type { Province } from "@/generated/prisma/client";
import { startTransition, useActionState, useMemo, useState } from "react";
import {
  StepFooter,
  StepperNav,
  useMultiStepForm,
  type StepDefinition,
} from "@/shared/components/multi-step-form";
import { createHotelAction } from "@/features/provider/hotels/actions";
import { HotelPreviewCard } from "./hotel-preview-card";
import { LocationPicker, type LatLng } from "@/shared/components/location-picker";

const INITIAL_ACTION_STATE = { status: "idle" as const };

const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_PHOTOS = 5;

const steps: StepDefinition[] = [
  { id: 1, title: "Thông tin cơ bản", subtitle: "Nội dung chính" },
  { id: 2, title: "Hình ảnh", subtitle: "Tối đa 5 ảnh" },
  { id: 3, title: "Danh sách phòng", subtitle: "Loại phòng & giá" },
];

export type HotelPhoto = {
  file: File;
  previewUrl: string;
};

export type RoomDraft = {
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
  photos: HotelPhoto[];
  rooms: RoomDraft[];
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none";
const labelClass = "block text-xs font-bold text-slate-700 mb-1.5";
const cardClass =
  "space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm";

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
      <ul className="mb-2 space-y-1.5">
        {items.map((item, index) => (
          <li
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm font-medium text-slate-700"
            key={`${item}-${index}`}
          >
            <span>{item}</span>
            <button
              className="text-slate-400 transition hover:text-rose-500"
              onClick={() => onRemove(index)}
              type="button"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
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
          className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          onClick={submit}
          type="button"
        >
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {photos.map((photo, index) => (
        <div
          className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200"
          key={photo.previewUrl}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`${altPrefix} ${index + 1}`}
            className="h-full w-full object-cover"
            src={photo.previewUrl}
          />
          <button
            className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-white/90 text-rose-600 opacity-0 shadow-sm transition group-hover:opacity-100"
            onClick={() => onRemove(index)}
            type="button"
          >
            ✕
          </button>
        </div>
      ))}
      {photos.length < MAX_PHOTOS ? (
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-brand-400 hover:text-brand-500">
          <span className="text-2xl leading-none">+</span>
          <span className="text-[11px] font-semibold">Thêm ảnh</span>
          <input
            accept="image/png,image/jpeg"
            className="hidden"
            multiple
            onChange={(event) => onSelect(event.target.files)}
            type="file"
          />
        </label>
      ) : null}
    </div>
  );
}

export function HotelForm({ provinces }: { provinces: Province[] }) {
  const [form, setForm] = useState<HotelFormState>(() =>
    createInitialState(provinces)
  );
  const { currentStep, goTo, next, prev, isFirst, isLast } =
    useMultiStepForm(steps.length);
  const [actionState, formAction, isPending] = useActionState(
    createHotelAction,
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

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - form.photos.length;
    const nextPhotos = Array.from(files)
      .slice(0, remaining)
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
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
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
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
    fd.append(
      "rooms",
      JSON.stringify(
        form.rooms.map((room) => ({
          name: room.name,
          description: room.description,
          capacity: room.capacity,
          quantity: room.quantity,
          basePrice: room.basePrice,
          amenities: room.amenities,
        }))
      )
    );
    form.photos.forEach((photo) => fd.append("photos", photo.file));
    form.rooms.forEach((room, index) => {
      room.photos.forEach((photo) =>
        fd.append(`room-photos-${index}`, photo.file)
      );
    });

    startTransition(() => {
      formAction(fd);
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Tạo Khách Sạn Mới
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Nhập thông tin chi tiết để giới thiệu khách sạn của bạn tới khách du
          lịch.
        </p>
      </section>

      {actionState.status === "error" && actionState.formError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
          {actionState.formError}
        </div>
      ) : null}
      {actionState.status === "error" && actionState.fieldErrors ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
          <ul className="list-inside list-disc space-y-1">
            {Object.entries(actionState.fieldErrors).map(([field, messages]) => (
              <li key={field}>{messages.join(", ")}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <StepperNav currentStep={currentStep} onStepClick={goTo} steps={steps} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          {currentStep === 1 ? (
            <div className={cardClass}>
              <h2 className="text-base font-bold text-slate-900">
                Thông tin cơ bản & Địa điểm
              </h2>

              <div>
                <label className={labelClass} htmlFor="name">
                  Tên khách sạn <span className="text-brand-500">*</span>
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
                    Tỉnh / Thành <span className="text-brand-500">*</span>
                  </label>
                  <select
                    className={inputClass}
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
                    Địa chỉ <span className="text-brand-500">*</span>
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
              />

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className={labelClass} htmlFor="description">
                    Mô tả chi tiết khách sạn
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {form.description.length} / {MAX_DESCRIPTION_LENGTH} ký tự
                  </span>
                </div>
                <textarea
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-medium leading-relaxed text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
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

              <TagList
                items={form.amenities}
                label="Tiện ích khách sạn"
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
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className={cardClass}>
              <h2 className="text-base font-bold text-slate-900">
                Hình ảnh khách sạn
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                Đã tải {form.photos.length}/{MAX_PHOTOS} ảnh
              </p>
              <PhotoPicker
                altPrefix="Ảnh khách sạn"
                onRemove={removePhoto}
                onSelect={handlePhotoSelect}
                photos={form.photos}
              />
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className={cardClass}>
              <h2 className="text-base font-bold text-slate-900">
                Danh sách loại phòng
              </h2>
              <div className="space-y-4">
                {form.rooms.map((room, index) => (
                  <div
                    className="space-y-4 rounded-xl border border-slate-200 p-4"
                    key={index}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                        {index + 1}
                      </span>
                      {form.rooms.length > 1 ? (
                        <button
                          className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                          onClick={() => removeRoom(index)}
                          type="button"
                        >
                          Xóa phòng này
                        </button>
                      ) : null}
                    </div>

                    <div>
                      <label className={labelClass}>
                        Tên loại phòng <span className="text-brand-500">*</span>
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
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-medium leading-relaxed text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
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
                          Sức chứa (khách){" "}
                          <span className="text-brand-500">*</span>
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
                          Số lượng phòng{" "}
                          <span className="text-brand-500">*</span>
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
                          Giá / đêm (VND){" "}
                          <span className="text-brand-500">*</span>
                        </label>
                        <input
                          className={inputClass}
                          min={0}
                          onChange={(event) =>
                            updateRoom(index, "basePrice", event.target.value)
                          }
                          placeholder="VD: 800000"
                          type="number"
                          value={room.basePrice}
                        />
                      </div>
                    </div>

                    <TagList
                      items={room.amenities}
                      label="Tiện ích phòng"
                      onAdd={(value) =>
                        updateRoom(index, "amenities", [
                          ...room.amenities,
                          value,
                        ])
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
                      <label className={labelClass}>Ảnh phòng</label>
                      <p className="mb-2 text-xs font-semibold text-slate-400">
                        Đã tải {room.photos.length}/{MAX_PHOTOS} ảnh
                      </p>
                      <PhotoPicker
                        altPrefix={`Ảnh ${room.name || "phòng"}`}
                        onRemove={(photoIndex) =>
                          removeRoomPhoto(index, photoIndex)
                        }
                        onSelect={(files) =>
                          handleRoomPhotoSelect(index, files)
                        }
                        photos={room.photos}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="w-full rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-brand-400 hover:text-brand-600"
                onClick={addRoom}
                type="button"
              >
                + Thêm loại phòng mới
              </button>
            </div>
          ) : null}

          <StepFooter
            cancelHref="/provider/profiles"
            isFirst={isFirst}
            isLast={isLast}
            lastLabel={
              isPending ? "Đang tạo khách sạn..." : "Hoàn tất & Xuất bản Khách sạn"
            }
            nextDisabled={isLast && isPending}
            onBack={prev}
            onNext={isLast ? handleSubmit : next}
          />
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <HotelPreviewCard
              address={form.address}
              amenities={form.amenities}
              description={form.description}
              name={form.name}
              photoCount={form.photos.length}
              photoUrl={form.photos[0]?.previewUrl}
              provinceName={selectedProvince?.fullName}
              rooms={form.rooms}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
