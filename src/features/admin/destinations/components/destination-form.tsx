"use client";

import type { Province, Tag } from "@/generated/prisma/client";
import { useMemo, useState } from "react";
import {
  StepFooter,
  StepperNav,
  useMultiStepForm,
  type StepDefinition,
} from "@/shared/components/multi-step-form";
import {
  LocationPicker,
  type LatLng,
} from "@/shared/components/location-picker";
import { DestinationPreviewCard } from "./destination-preview-card";

const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_PHOTOS = 5;

const steps: StepDefinition[] = [
  { id: 1, title: "Thông tin cơ bản", subtitle: "Nội dung chính" },
  { id: 2, title: "Hình ảnh", subtitle: "Tối đa 5 ảnh" },
];

export type DestinationPhoto = {
  file: File;
  previewUrl: string;
};

export type DestinationFormState = {
  name: string;
  provinceId: string;
  address: string;
  location: LatLng | null;
  ticketPrice: string;
  isPublished: boolean;
  description: string;
  tagIds: string[];
  photos: DestinationPhoto[];
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none";
const labelClass = "block text-xs font-bold text-slate-700 mb-1.5";
const cardClass =
  "space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm";

function createInitialState(provinces: Province[]): DestinationFormState {
  return {
    name: "",
    provinceId: provinces[0]?.id ?? "",
    address: "",
    location: null,
    ticketPrice: "",
    isPublished: true,
    description: "",
    tagIds: [],
    photos: [],
  };
}

export function DestinationForm({
  provinces,
  tags,
}: {
  provinces: Province[];
  tags: Tag[];
}) {
  const [form, setForm] = useState<DestinationFormState>(() =>
    createInitialState(provinces)
  );
  const [submitted, setSubmitted] = useState(false);
  const { currentStep, goTo, next, prev, isFirst, isLast } = useMultiStepForm(
    steps.length
  );

  const update = <K extends keyof DestinationFormState>(
    key: K,
    value: DestinationFormState[K]
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

  const handleSubmit = () => {
    // ponytail: UI-only — nối vào server action / API khi backend sẵn sàng.
    setSubmitted(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Tạo Địa Điểm Du Lịch Mới
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Nhập thông tin chi tiết để giới thiệu địa điểm du lịch tới du khách.
        </p>
      </section>

      {submitted ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600">
          Đã ghi nhận thông tin địa điểm. Chức năng lưu đang chờ backend.
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
                  Tên địa điểm <span className="text-brand-500">*</span>
                </label>
                <input
                  className={inputClass}
                  id="name"
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="VD: Bà Nà Hills"
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
                  <label className={labelClass} htmlFor="ticketPrice">
                    Giá vé (VND)
                  </label>
                  <input
                    className={inputClass}
                    id="ticketPrice"
                    min={0}
                    onChange={(event) =>
                      update("ticketPrice", event.target.value)
                    }
                    placeholder="VD: 250000"
                    type="number"
                    value={form.ticketPrice}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="isPublished">
                    Trạng thái
                  </label>
                  <label
                    className="flex h-[42px] cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4"
                    htmlFor="isPublished"
                  >
                    <input
                      checked={form.isPublished}
                      className="h-4 w-4 accent-brand-500"
                      id="isPublished"
                      onChange={(event) =>
                        update("isPublished", event.target.checked)
                      }
                      type="checkbox"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {form.isPublished ? "Xuất bản ngay" : "Lưu nháp"}
                    </span>
                  </label>
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
                  placeholder="VD: Thôn An Sơn, xã Hòa Ninh, Hòa Vang"
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
                    Mô tả chi tiết địa điểm
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
                  placeholder="Mô tả điểm tham quan, trải nghiệm, thời điểm đẹp..."
                  rows={6}
                  value={form.description}
                />
              </div>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className={cardClass}>
              <h2 className="text-base font-bold text-slate-900">
                Hình ảnh địa điểm
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
                      alt={`Ảnh địa điểm ${index + 1}`}
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

          <StepFooter
            cancelHref="/admin"
            isFirst={isFirst}
            isLast={isLast}
            lastLabel="Hoàn tất & Lưu Địa điểm"
            onBack={prev}
            onNext={isLast ? handleSubmit : next}
          />
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <DestinationPreviewCard
              address={form.address}
              description={form.description}
              isPublished={form.isPublished}
              name={form.name}
              photoCount={form.photos.length}
              photoUrl={form.photos[0]?.previewUrl}
              provinceName={selectedProvince?.fullName}
              tagNames={tags
                .filter((tag) => form.tagIds.includes(tag.id))
                .map((tag) => tag.name)}
              ticketPrice={form.ticketPrice}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
