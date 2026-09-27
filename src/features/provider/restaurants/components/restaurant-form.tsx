"use client";

import type { Province, Tag } from "@/generated/prisma/client";
import { startTransition, useActionState, useMemo, useState } from "react";
import {
  StepFooter,
  StepperNav,
  useMultiStepForm,
  type StepDefinition,
} from "@/shared/components/multi-step-form";
import { createRestaurantAction } from "@/features/provider/restaurants/actions";
import { LocationPicker, type LatLng } from "@/shared/components/location-picker";
import { RestaurantPreviewCard } from "./restaurant-preview-card";

const INITIAL_ACTION_STATE = { status: "idle" as const };

const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_PHOTOS = 5;

const steps: StepDefinition[] = [
  { id: 1, title: "Thông tin cơ bản", subtitle: "Nội dung chính" },
  { id: 2, title: "Hình ảnh", subtitle: "Tối đa 5 ảnh" },
  { id: 3, title: "Thực đơn", subtitle: "Món & giá" },
  { id: 4, title: "Khung giờ", subtitle: "Giờ mở & sức chứa" },
];

export type RestaurantPhoto = {
  file: File;
  previewUrl: string;
};

export type MenuItemDraft = {
  name: string;
  description: string;
  price: string;
};

export type TimeSlotDraft = {
  startTime: string;
  endTime: string;
};

export type RestaurantFormState = {
  name: string;
  provinceId: string;
  address: string;
  location: LatLng | null;
  phone: string;
  capacity: string;
  description: string;
  tagIds: string[];
  photos: RestaurantPhoto[];
  menu: MenuItemDraft[];
  timeSlots: TimeSlotDraft[];
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none";
const labelClass = "block text-xs font-bold text-slate-700 mb-1.5";
const cardClass =
  "space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm";

function createInitialMenuItem(): MenuItemDraft {
  return { name: "", description: "", price: "" };
}

function createInitialTimeSlot(): TimeSlotDraft {
  return { startTime: "", endTime: "" };
}

function createInitialState(provinces: Province[]): RestaurantFormState {
  return {
    name: "",
    provinceId: provinces[0]?.id ?? "",
    address: "",
    location: null,
    phone: "",
    capacity: "1",
    description: "",
    tagIds: [],
    photos: [],
    menu: [createInitialMenuItem()],
    timeSlots: [createInitialTimeSlot()],
  };
}

export function RestaurantForm({
  provinces,
  tags,
}: {
  provinces: Province[];
  tags: Tag[];
}) {
  const [form, setForm] = useState<RestaurantFormState>(() =>
    createInitialState(provinces)
  );
  const { currentStep, goTo, next, prev, isFirst, isLast } =
    useMultiStepForm(steps.length);
  const [actionState, formAction, isPending] = useActionState(
    createRestaurantAction,
    INITIAL_ACTION_STATE
  );

  const update = <K extends keyof RestaurantFormState>(
    key: K,
    value: RestaurantFormState[K]
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
    const next = Array.from(files)
      .slice(0, remaining)
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    update("photos", [...form.photos, ...next]);
  };

  const removePhoto = (index: number) =>
    update(
      "photos",
      form.photos.filter((_, i) => i !== index)
    );

  const updateMenuItem = <K extends keyof MenuItemDraft>(
    index: number,
    key: K,
    value: MenuItemDraft[K]
  ) =>
    update(
      "menu",
      form.menu.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    );
  const addMenuItem = () => update("menu", [...form.menu, createInitialMenuItem()]);
  const removeMenuItem = (index: number) =>
    update(
      "menu",
      form.menu.filter((_, i) => i !== index)
    );

  const updateTimeSlot = <K extends keyof TimeSlotDraft>(
    index: number,
    key: K,
    value: TimeSlotDraft[K]
  ) =>
    update(
      "timeSlots",
      form.timeSlots.map((slot, i) =>
        i === index ? { ...slot, [key]: value } : slot
      )
    );
  const addTimeSlot = () =>
    update("timeSlots", [...form.timeSlots, createInitialTimeSlot()]);
  const removeTimeSlot = (index: number) =>
    update(
      "timeSlots",
      form.timeSlots.filter((_, i) => i !== index)
    );

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("provinceId", form.provinceId);
    fd.append("address", form.address);
    if (form.location) {
      fd.append("latitude", String(form.location.lat));
      fd.append("longitude", String(form.location.lng));
    }
    fd.append("phone", form.phone);
    fd.append("capacity", form.capacity);
    fd.append("description", form.description);
    fd.append("tagIds", JSON.stringify(form.tagIds));
    fd.append("menu", JSON.stringify(form.menu));
    fd.append("timeSlots", JSON.stringify(form.timeSlots));
    form.photos.forEach((photo) => fd.append("photos", photo.file));

    startTransition(() => {
      formAction(fd);
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Tạo Nhà Hàng Mới
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Nhập thông tin chi tiết để giới thiệu nhà hàng của bạn tới thực khách.
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
                  Tên nhà hàng <span className="text-brand-500">*</span>
                </label>
                <input
                  className={inputClass}
                  id="name"
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="VD: Nhà hàng Hải Sản Biển Đông"
                  type="text"
                  value={form.name}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  <label className={labelClass} htmlFor="phone">
                    Số điện thoại
                  </label>
                  <input
                    className={inputClass}
                    id="phone"
                    onChange={(event) => update("phone", event.target.value)}
                    placeholder="VD: 0901234567"
                    type="tel"
                    value={form.phone}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="capacity">
                    Sức chứa (khách) <span className="text-brand-500">*</span>
                  </label>
                  <input
                    className={inputClass}
                    id="capacity"
                    min={1}
                    onChange={(event) => update("capacity", event.target.value)}
                    placeholder="VD: 120"
                    type="number"
                    value={form.capacity}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="address">
                  Địa chỉ <span className="text-brand-500">*</span>
                </label>
                <input
                  className={inputClass}
                  id="address"
                  onChange={(event) => update("address", event.target.value)}
                  placeholder="VD: 123 Trần Phú, Hải Châu"
                  type="text"
                  value={form.address}
                />
              </div>

              <LocationPicker
                onChange={(value) => update("location", value)}
                value={form.location}
              />

              <div>
                <label className={labelClass}>Thẻ / Tag phân loại</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const selected = form.tagIds.includes(tag.id);
                    return (
                      <button
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                          selected
                            ? "border-brand-500 bg-brand-50 text-brand-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        type="button"
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                  {tags.length === 0 ? (
                    <p className="text-xs font-medium text-slate-400">
                      Chưa có tag nào trong hệ thống.
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className={labelClass} htmlFor="description">
                    Mô tả chi tiết nhà hàng
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
                  placeholder="Mô tả không gian, phong cách ẩm thực, món đặc sắc..."
                  rows={6}
                  value={form.description}
                />
              </div>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className={cardClass}>
              <h2 className="text-base font-bold text-slate-900">
                Hình ảnh nhà hàng
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                Đã tải {form.photos.length}/{MAX_PHOTOS} ảnh
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {form.photos.map((photo, index) => (
                  <div
                    className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200"
                    key={photo.previewUrl}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={`Ảnh nhà hàng ${index + 1}`}
                      className="h-full w-full object-cover"
                      src={photo.previewUrl}
                    />
                    <button
                      className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-white/90 text-rose-600 opacity-0 shadow-sm transition group-hover:opacity-100"
                      onClick={() => removePhoto(index)}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {form.photos.length < MAX_PHOTOS ? (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-brand-400 hover:text-brand-500">
                    <span className="text-2xl leading-none">+</span>
                    <span className="text-[11px] font-semibold">Thêm ảnh</span>
                    <input
                      accept="image/png,image/jpeg"
                      className="hidden"
                      multiple
                      onChange={(event) =>
                        handlePhotoSelect(event.target.files)
                      }
                      type="file"
                    />
                  </label>
                ) : null}
              </div>
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className={cardClass}>
              <h2 className="text-base font-bold text-slate-900">
                Thực đơn của nhà hàng
              </h2>
              <div className="space-y-4">
                {form.menu.map((item, index) => (
                  <div
                    className="space-y-4 rounded-xl border border-slate-200 p-4"
                    key={index}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                        {index + 1}
                      </span>
                      {form.menu.length > 1 ? (
                        <button
                          className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                          onClick={() => removeMenuItem(index)}
                          type="button"
                        >
                          Xóa món này
                        </button>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="md:col-span-2">
                        <label className={labelClass}>
                          Tên món <span className="text-brand-500">*</span>
                        </label>
                        <input
                          className={inputClass}
                          onChange={(event) =>
                            updateMenuItem(index, "name", event.target.value)
                          }
                          placeholder="VD: Tôm hùm nướng bơ tỏi"
                          type="text"
                          value={item.name}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Giá (VND) <span className="text-brand-500">*</span>
                        </label>
                        <input
                          className={inputClass}
                          min={0}
                          onChange={(event) =>
                            updateMenuItem(index, "price", event.target.value)
                          }
                          placeholder="VD: 350000"
                          type="number"
                          value={item.price}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Mô tả món</label>
                      <textarea
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-medium leading-relaxed text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
                        onChange={(event) =>
                          updateMenuItem(
                            index,
                            "description",
                            event.target.value
                          )
                        }
                        placeholder="Mô tả nguyên liệu, cách chế biến, khẩu phần..."
                        rows={2}
                        value={item.description}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="w-full rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-brand-400 hover:text-brand-600"
                onClick={addMenuItem}
                type="button"
              >
                + Thêm món mới
              </button>
            </div>
          ) : null}

          {currentStep === 4 ? (
            <div className={cardClass}>
              <h2 className="text-base font-bold text-slate-900">
                Khung giờ phục vụ
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                Mỗi khung giờ bắt đầu không được trùng nhau.
              </p>
              <div className="space-y-4">
                {form.timeSlots.map((slot, index) => (
                  <div
                    className="space-y-4 rounded-xl border border-slate-200 p-4"
                    key={index}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                        {index + 1}
                      </span>
                      {form.timeSlots.length > 1 ? (
                        <button
                          className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                          onClick={() => removeTimeSlot(index)}
                          type="button"
                        >
                          Xóa khung giờ này
                        </button>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>
                          Giờ bắt đầu <span className="text-brand-500">*</span>
                        </label>
                        <input
                          className={inputClass}
                          onChange={(event) =>
                            updateTimeSlot(
                              index,
                              "startTime",
                              event.target.value
                            )
                          }
                          type="time"
                          value={slot.startTime}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Giờ kết thúc <span className="text-brand-500">*</span>
                        </label>
                        <input
                          className={inputClass}
                          onChange={(event) =>
                            updateTimeSlot(index, "endTime", event.target.value)
                          }
                          type="time"
                          value={slot.endTime}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="w-full rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-brand-400 hover:text-brand-600"
                onClick={addTimeSlot}
                type="button"
              >
                + Thêm khung giờ mới
              </button>
            </div>
          ) : null}

          <StepFooter
            cancelHref="/provider/profiles"
            isFirst={isFirst}
            isLast={isLast}
            lastLabel={
              isPending ? "Đang tạo nhà hàng..." : "Hoàn tất & Xuất bản Nhà hàng"
            }
            nextDisabled={isLast && isPending}
            onBack={prev}
            onNext={isLast ? handleSubmit : next}
          />
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <RestaurantPreviewCard
              address={form.address}
              capacity={form.capacity}
              description={form.description}
              menu={form.menu}
              name={form.name}
              phone={form.phone}
              photoCount={form.photos.length}
              photoUrl={form.photos[0]?.previewUrl}
              provinceName={selectedProvince?.fullName}
              tagNames={tags
                .filter((tag) => form.tagIds.includes(tag.id))
                .map((tag) => tag.name)}
              timeSlots={form.timeSlots}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
