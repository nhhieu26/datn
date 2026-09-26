"use client";

import type { Province, Tag } from "@/generated/prisma/client";
import { startTransition, useActionState, useMemo, useState } from "react";
import {
  StepFooter,
  StepperNav,
  useMultiStepForm,
  type StepDefinition,
} from "@/shared/components/multi-step-form";
import { createTourAction } from "@/features/provider/tours/actions";
import { TourPreviewCard } from "./tour-preview-card";

const INITIAL_ACTION_STATE = { status: "idle" as const };

const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_PHOTOS = 5;

const steps: StepDefinition[] = [
  { id: 1, title: "Thông tin & Dịch vụ", subtitle: "Nội dung chính" },
  { id: 2, title: "Hình ảnh", subtitle: "Tối đa 5 ảnh" },
  { id: 3, title: "Lịch trình", subtitle: "Chi tiết theo ngày" },
  { id: 4, title: "Giá & Khởi hành", subtitle: "Đợt khởi hành" },
];

export type ItineraryDay = {
  title: string;
  description: string;
};

export type TourDepartureDraft = {
  departureDate: string;
  returnDate: string;
  price: string;
  totalSlots: string;
};

export type TourPhoto = {
  file: File;
  previewUrl: string;
};

export type TourFormState = {
  title: string;
  provinceId: string;
  tagIds: string[];
  durationDays: string;
  durationNights: string;
  description: string;
  includeServices: string[];
  excludeServices: string[];
  photos: TourPhoto[];
  itinerary: ItineraryDay[];
  basePrice: string;
  departures: TourDepartureDraft[];
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none";
const labelClass = "block text-xs font-bold text-slate-700 mb-1.5";
const cardClass =
  "space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm";

function createInitialState(provinces: Province[]): TourFormState {
  return {
    title: "",
    provinceId: provinces[0]?.id ?? "",
    tagIds: [],
    durationDays: "1",
    durationNights: "0",
    description: "",
    includeServices: [],
    excludeServices: [],
    photos: [],
    itinerary: [{ title: "", description: "" }],
    basePrice: "",
    departures: [
      { departureDate: "", returnDate: "", price: "", totalSlots: "" },
    ],
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

export function TourForm({
  provinces,
  tags,
}: {
  provinces: Province[];
  tags: Tag[];
}) {
  const [form, setForm] = useState<TourFormState>(() =>
    createInitialState(provinces)
  );
  const { currentStep, goTo, next, prev, isFirst, isLast } =
    useMultiStepForm(steps.length);
  const [actionState, formAction, isPending] = useActionState(
    createTourAction,
    INITIAL_ACTION_STATE
  );

  const update = <K extends keyof TourFormState>(
    key: K,
    value: TourFormState[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const selectedProvince = useMemo(
    () => provinces.find((province) => province.id === form.provinceId),
    [provinces, form.provinceId]
  );

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("provinceId", form.provinceId);
    fd.append("durationDays", form.durationDays);
    fd.append("durationNights", form.durationNights);
    fd.append("description", form.description);
    fd.append("basePrice", form.basePrice);
    fd.append("tagIds", JSON.stringify(form.tagIds));
    fd.append("includeServices", JSON.stringify(form.includeServices));
    fd.append("excludeServices", JSON.stringify(form.excludeServices));
    fd.append("itinerary", JSON.stringify(form.itinerary));
    fd.append(
      "departures",
      JSON.stringify(
        form.departures.map((departure) => ({
          departureDate: departure.departureDate,
          returnDate: departure.returnDate || null,
          price: departure.price || null,
          totalSlots: departure.totalSlots,
        }))
      )
    );
    form.photos.forEach((photo) => fd.append("photos", photo.file));

    startTransition(() => {
      formAction(fd);
    });
  };

  const addItineraryDay = () =>
    update("itinerary", [...form.itinerary, { title: "", description: "" }]);
  const removeItineraryDay = (index: number) =>
    update(
      "itinerary",
      form.itinerary.filter((_, i) => i !== index)
    );
  const updateItineraryDay = (
    index: number,
    field: keyof ItineraryDay,
    value: string
  ) =>
    update(
      "itinerary",
      form.itinerary.map((day, i) =>
        i === index ? { ...day, [field]: value } : day
      )
    );

  const addDeparture = () =>
    update("departures", [
      ...form.departures,
      { departureDate: "", returnDate: "", price: "", totalSlots: "" },
    ]);
  const removeDeparture = (index: number) =>
    update(
      "departures",
      form.departures.filter((_, i) => i !== index)
    );
  const updateDeparture = (
    index: number,
    field: keyof TourDepartureDraft,
    value: string
  ) =>
    update(
      "departures",
      form.departures.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );

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

  const toggleTag = (tagId: string) => {
    update(
      "tagIds",
      form.tagIds.includes(tagId)
        ? form.tagIds.filter((id) => id !== tagId)
        : [...form.tagIds, tagId]
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Tạo Tour Mới
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Nhập thông tin chi tiết để giới thiệu tour của bạn tới khách du lịch.
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
            <>
              <div className={cardClass}>
                <h2 className="text-base font-bold text-slate-900">
                  Thông tin cơ bản & Địa điểm
                </h2>

                <div>
                  <label className={labelClass} htmlFor="title">
                    Tiêu đề Tour <span className="text-brand-500">*</span>
                  </label>
                  <input
                    className={inputClass}
                    id="title"
                    onChange={(event) => update("title", event.target.value)}
                    placeholder="VD: Khám phá vịnh Hạ Long 3 ngày 2 đêm"
                    type="text"
                    value={form.title}
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
                    <label className={labelClass} htmlFor="durationDays">
                      Số ngày <span className="text-brand-500">*</span>
                    </label>
                    <select
                      className={inputClass}
                      id="durationDays"
                      onChange={(event) =>
                        update("durationDays", event.target.value)
                      }
                      value={form.durationDays}
                    >
                      {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          {day} ngày
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="durationNights">
                      Số đêm <span className="text-brand-500">*</span>
                    </label>
                    <select
                      className={inputClass}
                      id="durationNights"
                      onChange={(event) =>
                        update("durationNights", event.target.value)
                      }
                      value={form.durationNights}
                    >
                      {Array.from({ length: 7 }, (_, i) => i).map((night) => (
                        <option key={night} value={night}>
                          {night} đêm
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

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
                      Mô tả chi tiết Tour{" "}
                      <span className="text-brand-500">*</span>
                    </label>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {form.description.length} / {MAX_DESCRIPTION_LENGTH} ký
                      tự
                    </span>
                  </div>
                  <textarea
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-medium leading-relaxed text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
                    id="description"
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    onChange={(event) =>
                      update("description", event.target.value)
                    }
                    placeholder="Mô tả hành trình, điểm nổi bật, trải nghiệm..."
                    rows={6}
                    value={form.description}
                  />
                </div>
              </div>

              <div className={cardClass}>
                <h2 className="text-base font-bold text-slate-900">
                  Dịch vụ & Tiện ích Tour
                </h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <TagList
                    items={form.includeServices}
                    label="Dịch vụ bao gồm"
                    onAdd={(value) =>
                      update("includeServices", [
                        ...form.includeServices,
                        value,
                      ])
                    }
                    onRemove={(index) =>
                      update(
                        "includeServices",
                        form.includeServices.filter((_, i) => i !== index)
                      )
                    }
                    placeholder="VD: Xe đưa đón, hướng dẫn viên..."
                  />
                  <TagList
                    items={form.excludeServices}
                    label="Dịch vụ KHÔNG bao gồm"
                    onAdd={(value) =>
                      update("excludeServices", [
                        ...form.excludeServices,
                        value,
                      ])
                    }
                    onRemove={(index) =>
                      update(
                        "excludeServices",
                        form.excludeServices.filter((_, i) => i !== index)
                      )
                    }
                    placeholder="VD: Chi phí cá nhân, đồ uống..."
                  />
                </div>
              </div>
            </>
          ) : null}

          {currentStep === 2 ? (
            <div className={cardClass}>
              <h2 className="text-base font-bold text-slate-900">
                Hình ảnh Tour
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
                      alt={`Ảnh tour ${index + 1}`}
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
                Lịch trình chi tiết
              </h2>
              <div className="space-y-4">
                {form.itinerary.map((day, index) => (
                  <div
                    className="space-y-3 rounded-xl border border-slate-200 p-4"
                    key={index}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                        {index + 1}
                      </span>
                      {form.itinerary.length > 1 ? (
                        <button
                          className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                          onClick={() => removeItineraryDay(index)}
                          type="button"
                        >
                          Xóa chặng này
                        </button>
                      ) : null}
                    </div>
                    <div>
                      <label className={labelClass}>
                        Tên chặng / Tiêu đề ngày{" "}
                        <span className="text-brand-500">*</span>
                      </label>
                      <input
                        className={inputClass}
                        onChange={(event) =>
                          updateItineraryDay(index, "title", event.target.value)
                        }
                        placeholder="VD: Khởi hành - Tham quan trung tâm thành phố"
                        type="text"
                        value={day.title}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Mô tả chi tiết hoạt động{" "}
                        <span className="text-brand-500">*</span>
                      </label>
                      <textarea
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-medium leading-relaxed text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
                        onChange={(event) =>
                          updateItineraryDay(
                            index,
                            "description",
                            event.target.value
                          )
                        }
                        placeholder="Mô tả hoạt động theo khung giờ..."
                        rows={3}
                        value={day.description}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="w-full rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-brand-400 hover:text-brand-600"
                onClick={addItineraryDay}
                type="button"
              >
                + Thêm ngày lịch trình
              </button>
            </div>
          ) : null}

          {currentStep === 4 ? (
            <>
              <div className={cardClass}>
                <h2 className="text-base font-bold text-slate-900">
                  Giá cơ bản niêm yết
                </h2>
                <div>
                  <label className={labelClass} htmlFor="basePrice">
                    Giá khởi điểm / Người (VND){" "}
                    <span className="text-brand-500">*</span>
                  </label>
                  <input
                    className={inputClass}
                    id="basePrice"
                    onChange={(event) =>
                      update("basePrice", event.target.value)
                    }
                    placeholder="VD: 2500000"
                    type="number"
                    value={form.basePrice}
                  />
                </div>
              </div>

              <div className={cardClass}>
                <h2 className="text-base font-bold text-slate-900">
                  Lịch khởi hành theo từng đợt
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs font-bold text-slate-500">
                        <th className="pb-2 pr-2">Ngày bắt đầu</th>
                        <th className="pb-2 pr-2">Ngày kết thúc</th>
                        <th className="pb-2 pr-2">Giá đợt</th>
                        <th className="pb-2 pr-2">Tổng chỗ</th>
                        <th className="pb-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {form.departures.map((row, index) => (
                        <tr className="border-b border-slate-100" key={index}>
                          <td className="py-2 pr-2">
                            <input
                              className={inputClass}
                              onChange={(event) =>
                                updateDeparture(
                                  index,
                                  "departureDate",
                                  event.target.value
                                )
                              }
                              type="date"
                              value={row.departureDate}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              className={inputClass}
                              onChange={(event) =>
                                updateDeparture(
                                  index,
                                  "returnDate",
                                  event.target.value
                                )
                              }
                              type="date"
                              value={row.returnDate}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              className={inputClass}
                              onChange={(event) =>
                                updateDeparture(
                                  index,
                                  "price",
                                  event.target.value
                                )
                              }
                              placeholder={form.basePrice || "Mặc định"}
                              type="number"
                              value={row.price}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              className={inputClass}
                              onChange={(event) =>
                                updateDeparture(
                                  index,
                                  "totalSlots",
                                  event.target.value
                                )
                              }
                              type="number"
                              value={row.totalSlots}
                            />
                          </td>
                          <td className="py-2 text-right">
                            {form.departures.length > 1 ? (
                              <button
                                className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                                onClick={() => removeDeparture(index)}
                                type="button"
                              >
                                Xóa
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className="w-full rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-brand-400 hover:text-brand-600"
                  onClick={addDeparture}
                  type="button"
                >
                  + Thêm đợt khởi hành mới
                </button>
              </div>
            </>
          ) : null}

          <StepFooter
            cancelHref="/provider/tours"
            isFirst={isFirst}
            isLast={isLast}
            lastLabel={isPending ? "Đang tạo tour..." : "Hoàn tất & Xuất bản Tour"}
            nextDisabled={isLast && isPending}
            onBack={prev}
            onNext={isLast ? handleSubmit : next}
          />
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <TourPreviewCard
              basePrice={form.basePrice}
              departures={form.departures}
              description={form.description}
              durationDays={form.durationDays}
              durationNights={form.durationNights}
              includeServices={form.includeServices}
              itinerary={form.itinerary}
              photoCount={form.photos.length}
              photoUrl={form.photos[0]?.previewUrl}
              provinceName={selectedProvince?.fullName}
              tagNames={tags
                .filter((tag) => form.tagIds.includes(tag.id))
                .map((tag) => tag.name)}
              title={form.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
