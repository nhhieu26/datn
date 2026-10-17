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
  createTourAction,
  updateTourAction,
} from "@/features/provider/tours/actions";
import { TourDetailPreview } from "./tour-detail-preview";
import { TourIcon } from "./tour-icon";

const INITIAL_ACTION_STATE = { status: "idle" as const };

const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_PHOTOS = 5;

const steps: StepDefinition[] = [
  { id: 1, title: "Thông tin & Dịch vụ", subtitle: "Nội dung chính" },
  { id: 2, title: "Hình ảnh", subtitle: "Tối đa 5 ảnh" },
  { id: 3, title: "Lịch trình", subtitle: "Chi tiết theo ngày" },
  { id: 4, title: "Giá & Khởi hành", subtitle: "Đợt khởi hành" },
  { id: 5, title: "Xem trước", subtitle: "Trang chi tiết tour" },
];

export type ItineraryDay = {
  title: string;
  description: string;
};

export type TourDepartureDraft = {
  id?: string;
  bookedSlots?: number;
  departureDate: string;
  returnDate: string;
  price: string;
  totalSlots: string;
};

export type TourPhoto =
  | { kind: "new"; file: File; previewUrl: string }
  | { kind: "existing"; fileId: string; previewUrl: string };

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
                <TourIcon className="size-3" name="x" />
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
          <TourIcon name="plus" />
          Thêm
        </button>
      </div>
    </div>
  );
}

export function TourForm({
  provinces,
  tags,
  mode = "create",
  tourId,
  initialValues,
}: {
  provinces: Province[];
  tags: Tag[];
  mode?: "create" | "edit";
  tourId?: string;
  initialValues?: TourFormState;
}) {
  const [form, setForm] = useState<TourFormState>(
    () => initialValues ?? createInitialState(provinces)
  );
  const { currentStep, goTo, next, prev, isFirst, isLast } =
    useMultiStepForm(steps.length);
  const [actionState, formAction, isPending] = useActionState(
    mode === "edit" ? updateTourAction.bind(null, tourId!) : createTourAction,
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
          id: departure.id,
          departureDate: departure.departureDate,
          returnDate: departure.returnDate || null,
          price: departure.price || null,
          totalSlots: departure.totalSlots,
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
      .map((file) => ({
        kind: "new" as const,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
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
        ? "Đang tạo tour..."
        : "Hoàn tất & Xuất bản Tour";

  return (
    <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="grid gap-3 md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {mode === "edit" ? "Chỉnh sửa Tour" : "Tạo Tour Mới"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
            {mode === "edit"
              ? "Cập nhật thông tin, hình ảnh, lịch trình và lịch khởi hành của tour."
              : "Nhập thông tin chi tiết để giới thiệu tour của bạn tới khách du lịch."}
          </p>
        </div>
        <Link
          className={`${layerButtonClass} self-start md:self-auto`}
          href="/provider/tours"
        >
          <TourIcon name="chevronLeft" />
          Danh sách tour
        </Link>
      </div>

      {actionState.status === "error" &&
      (actionState.formError || actionState.fieldErrors) ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <div className="flex gap-x-3">
            <TourIcon className="mt-0.5 size-4" name="alert" />
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
                <label className={labelClass} htmlFor="title">
                  Tiêu đề Tour {requiredMark}
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
                  <label className={labelClass} htmlFor="durationDays">
                    Số ngày {requiredMark}
                  </label>
                  <select
                    className={selectClass}
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
                    Số đêm {requiredMark}
                  </label>
                  <select
                    className={selectClass}
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
                          <TourIcon className="size-3" name="tick" />
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
                    Mô tả chi tiết Tour {requiredMark}
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
                  placeholder="Mô tả hành trình, điểm nổi bật, trải nghiệm..."
                  rows={6}
                  value={form.description}
                />
              </div>
            </Card>

            <Card title="Dịch vụ & Tiện ích Tour">
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
            </Card>
          </>
        ) : null}

        {currentStep === 2 ? (
          <Card
            action={
              <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-surface-foreground">
                {form.photos.length}/{MAX_PHOTOS} ảnh
              </span>
            }
            description="Ảnh đầu tiên sẽ được dùng làm ảnh bìa. Hỗ trợ PNG, JPG."
            title="Hình ảnh Tour"
          >
            {form.photos.length < MAX_PHOTOS ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-layer-line bg-layer p-8 text-center hover:border-primary-line">
                <span className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground-2">
                  <TourIcon className="size-5" name="upload" />
                </span>
                <span className="mt-3 text-sm text-foreground">
                  <span className="font-medium text-primary">
                    Chọn ảnh tải lên
                  </span>{" "}
                  hoặc kéo thả vào đây
                </span>
                <span className="mt-1 text-xs text-muted-foreground-1">
                  Còn lại {MAX_PHOTOS - form.photos.length} ảnh
                </span>
                <input
                  accept="image/png,image/jpeg"
                  className="hidden"
                  multiple
                  onChange={(event) => handlePhotoSelect(event.target.files)}
                  type="file"
                />
              </label>
            ) : null}
            {form.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {form.photos.map((photo, index) => (
                  <div
                    className="group relative aspect-square overflow-hidden rounded-lg border border-layer-line"
                    key={photo.previewUrl}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={`Ảnh tour ${index + 1}`}
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
                      onClick={() => removePhoto(index)}
                      type="button"
                    >
                      <TourIcon className="size-3.5" name="x" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        ) : null}

        {currentStep === 3 ? (
          <Card title="Lịch trình chi tiết">
            <div>
              {form.itinerary.map((day, index) => (
                <div className="group relative flex gap-x-4" key={index}>
                  <div className="relative after:absolute after:start-3.5 after:top-8 after:bottom-0 after:w-px after:-translate-x-[0.5px] after:bg-line-2 group-last:after:hidden">
                    <span className="relative z-10 flex size-7 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                      {index + 1}
                    </span>
                  </div>
                  <div className="grow space-y-3 pb-6 group-last:pb-0">
                    <div className="flex min-h-7 items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">
                        Ngày {index + 1}
                      </h3>
                      {form.itinerary.length > 1 ? (
                        <button
                          className={destructiveTextButtonClass}
                          onClick={() => removeItineraryDay(index)}
                          type="button"
                        >
                          <TourIcon className="size-3.5" name="trash" />
                          Xóa chặng này
                        </button>
                      ) : null}
                    </div>
                    <div>
                      <label className={labelClass}>
                        Tên chặng / Tiêu đề ngày {requiredMark}
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
                        Mô tả chi tiết hoạt động {requiredMark}
                      </label>
                      <textarea
                        className={textareaClass}
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
                </div>
              ))}
            </div>
            <button
              className={dashedButtonClass}
              onClick={addItineraryDay}
              type="button"
            >
              <TourIcon name="plus" />
              Thêm ngày lịch trình
            </button>
          </Card>
        ) : null}

        {currentStep === 4 ? (
          <>
            <Card title="Giá cơ bản niêm yết">
              <div>
                <label className={labelClass} htmlFor="basePrice">
                  Giá khởi điểm / Người {requiredMark}
                </label>
                <div className="relative">
                  <input
                    className={`${inputClass} pe-16`}
                    id="basePrice"
                    onChange={(event) =>
                      update("basePrice", event.target.value)
                    }
                    placeholder="VD: 2500000"
                    type="number"
                    value={form.basePrice}
                  />
                  <div className="pointer-events-none absolute inset-y-0 end-0 z-20 flex items-center pe-4">
                    <span className="text-sm text-muted-foreground-1">
                      VND
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex flex-col overflow-hidden rounded-xl border border-card-line bg-card shadow-2xs">
              <div className="border-b border-card-divider px-4 py-3 md:px-5">
                <h2 className="font-semibold text-foreground">
                  Lịch khởi hành theo từng đợt
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-160 w-full divide-y divide-table-line">
                  <thead className="bg-surface">
                    <tr>
                      {["Ngày bắt đầu", "Ngày kết thúc", "Giá đợt", "Tổng chỗ"].map(
                        (heading) => (
                          <th
                            className="px-3 py-3 text-start text-xs font-medium tracking-wide text-muted-foreground-1 uppercase first:ps-4 md:first:ps-5"
                            key={heading}
                            scope="col"
                          >
                            {heading}
                          </th>
                        )
                      )}
                      <th className="px-3 py-3 pe-4 md:pe-5" scope="col" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-table-line">
                    {form.departures.map((row, index) => (
                      <tr key={index}>
                        <td className="px-3 py-3 ps-4 md:ps-5">
                          <input
                            className={inputClass}
                            disabled={Boolean(row.bookedSlots)}
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
                        <td className="px-3 py-3">
                          <input
                            className={inputClass}
                            disabled={Boolean(row.bookedSlots)}
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
                        <td className="px-3 py-3">
                          <input
                            className={inputClass}
                            disabled={Boolean(row.bookedSlots)}
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
                        <td className="px-3 py-3">
                          <input
                            className={inputClass}
                            disabled={Boolean(row.bookedSlots)}
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
                        <td className="px-3 py-3 pe-4 text-end whitespace-nowrap md:pe-5">
                          {row.bookedSlots ? (
                            <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-800">
                              Đã đặt {row.bookedSlots} chỗ
                            </span>
                          ) : (
                            <button
                              aria-label="Xóa đợt khởi hành"
                              className="inline-flex size-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-hidden"
                              onClick={() => removeDeparture(index)}
                              type="button"
                            >
                              <TourIcon name="trash" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-card-divider p-4 md:p-5">
                <button
                  className={dashedButtonClass}
                  onClick={addDeparture}
                  type="button"
                >
                  <TourIcon name="plus" />
                  Thêm đợt khởi hành mới
                </button>
              </div>
            </div>
          </>
        ) : null}

        {isPreviewStep ? (
          <TourDetailPreview
            form={form}
            provinceName={selectedProvince?.name}
            tagNames={selectedTagNames}
          />
        ) : null}

        <div className="flex items-center justify-between gap-x-2 rounded-xl border border-card-line bg-card px-4 py-3 shadow-2xs md:px-5">
          {isFirst ? (
            <Link className={layerButtonClass} href="/provider/tours">
              Hủy thao tác
            </Link>
          ) : (
            <button className={layerButtonClass} onClick={prev} type="button">
              <TourIcon name="chevronLeft" />
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
            {isLast ? null : <TourIcon name="chevronRight" />}
          </button>
        </div>
      </div>
    </div>
  );
}
