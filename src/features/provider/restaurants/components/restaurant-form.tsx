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
  createRestaurantAction,
  updateRestaurantAction,
} from "@/features/provider/restaurants/actions";
import {
  FIXED_TIME_SLOTS,
  TIME_BOUNDARIES,
  getSlotsWithinRange,
} from "@/entities/restaurant/time-slots";
import { LocationPicker, type LatLng } from "@/shared/components/location-picker";
import { RestaurantDetailPreview } from "./restaurant-detail-preview";
import { RestaurantIcon } from "./restaurant-icon";

const INITIAL_ACTION_STATE = { status: "idle" as const };

const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_PHOTOS = 5;

const steps: StepDefinition[] = [
  { id: 1, title: "Thông tin cơ bản", subtitle: "Nội dung chính" },
  { id: 2, title: "Hình ảnh", subtitle: "Tối đa 5 ảnh" },
  { id: 3, title: "Thực đơn", subtitle: "Món & giá" },
  { id: 4, title: "Khung giờ", subtitle: "Giờ mở & sức chứa" },
  { id: 5, title: "Xem trước", subtitle: "Trang chi tiết nhà hàng" },
];

export type RestaurantPhoto =
  | { kind: "new"; file: File; previewUrl: string }
  | { kind: "existing"; fileId: string; previewUrl: string };

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

function chipClass(selected: boolean) {
  return `inline-flex items-center gap-x-1.5 rounded-full border px-3 py-1.5 text-xs font-medium focus:outline-hidden ${
    selected
      ? "border-primary-line bg-primary-50 text-primary-700"
      : "border-layer-line bg-layer text-layer-foreground hover:bg-layer-hover"
  }`;
}

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

function createInitialMenuItem(): MenuItemDraft {
  return { name: "", description: "", price: "" };
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
    timeSlots: [],
  };
}

function sortTimeSlots(slots: TimeSlotDraft[]): TimeSlotDraft[] {
  return [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function RestaurantForm({
  provinces,
  tags,
  mode = "create",
  restaurantId,
  initialValues,
}: {
  provinces: Province[];
  tags: Tag[];
  mode?: "create" | "edit";
  restaurantId?: string;
  initialValues?: RestaurantFormState;
}) {
  const [form, setForm] = useState<RestaurantFormState>(
    () => initialValues ?? createInitialState(provinces)
  );
  const [rangeStart, setRangeStart] = useState(TIME_BOUNDARIES[0]);
  const [rangeEnd, setRangeEnd] = useState(
    TIME_BOUNDARIES[TIME_BOUNDARIES.length - 1]
  );
  const { currentStep, goTo, next, prev, isFirst, isLast } =
    useMultiStepForm(steps.length);
  const [actionState, formAction, isPending] = useActionState(
    mode === "edit"
      ? updateRestaurantAction.bind(null, restaurantId!)
      : createRestaurantAction,
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
  const addMenuItem = () =>
    update("menu", [...form.menu, createInitialMenuItem()]);
  const removeMenuItem = (index: number) =>
    update(
      "menu",
      form.menu.filter((_, i) => i !== index)
    );

  const toggleTimeSlot = (slot: TimeSlotDraft) => {
    const isSelected = form.timeSlots.some(
      (s) => s.startTime === slot.startTime
    );
    update(
      "timeSlots",
      sortTimeSlots(
        isSelected
          ? form.timeSlots.filter((s) => s.startTime !== slot.startTime)
          : [...form.timeSlots, slot]
      )
    );
  };

  const applyRange = (rangeStart: string, rangeEnd: string) => {
    const slotsInRange = getSlotsWithinRange(rangeStart, rangeEnd);
    const existingStartTimes = new Set(
      form.timeSlots.map((slot) => slot.startTime)
    );
    const merged = [
      ...form.timeSlots,
      ...slotsInRange.filter((slot) => !existingStartTimes.has(slot.startTime)),
    ];
    update("timeSlots", sortTimeSlots(merged));
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
    fd.append("phone", form.phone);
    fd.append("capacity", form.capacity);
    fd.append("description", form.description);
    fd.append("tagIds", JSON.stringify(form.tagIds));
    fd.append("menu", JSON.stringify(form.menu));
    fd.append("timeSlots", JSON.stringify(form.timeSlots));
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
        ? "Đang tạo nhà hàng..."
        : "Hoàn tất & Xuất bản Nhà hàng";

  return (
    <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="grid gap-3 md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {mode === "edit" ? "Chỉnh sửa Nhà hàng" : "Tạo Nhà Hàng Mới"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
            {mode === "edit"
              ? "Cập nhật thông tin, hình ảnh, thực đơn và khung giờ phục vụ của nhà hàng."
              : "Nhập thông tin chi tiết để giới thiệu nhà hàng của bạn tới thực khách."}
          </p>
        </div>
        <Link
          className={`${layerButtonClass} self-start md:self-auto`}
          href="/provider/restaurants"
        >
          <RestaurantIcon name="chevronLeft" />
          Danh sách nhà hàng
        </Link>
      </div>

      {actionState.status === "error" &&
      (actionState.formError || actionState.fieldErrors) ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <div className="flex gap-x-3">
            <RestaurantIcon className="mt-0.5 size-4" name="alert" />
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
          <Card title="Thông tin cơ bản & Địa điểm">
            <div>
              <label className={labelClass} htmlFor="name">
                Tên nhà hàng {requiredMark}
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
                  Tỉnh / Thành {requiredMark}
                </label>
                <select
                  className={selectClass}
                  id="provinceId"
                  onChange={(event) => update("provinceId", event.target.value)}
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
                  Sức chứa (khách) {requiredMark}
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
                Địa chỉ {requiredMark}
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
                      className={chipClass(selected)}
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      type="button"
                    >
                      {selected ? (
                        <RestaurantIcon className="size-3" name="tick" />
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
                  Mô tả chi tiết nhà hàng
                </label>
                <span className="text-xs text-muted-foreground-1">
                  {form.description.length} / {MAX_DESCRIPTION_LENGTH} ký tự
                </span>
              </div>
              <textarea
                className={textareaClass}
                id="description"
                maxLength={MAX_DESCRIPTION_LENGTH}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Mô tả không gian, phong cách ẩm thực, món đặc sắc..."
                rows={6}
                value={form.description}
              />
            </div>
          </Card>
        ) : null}

        {currentStep === 2 ? (
          <Card
            action={
              <span className={countBadgeClass}>
                {form.photos.length}/{MAX_PHOTOS} ảnh
              </span>
            }
            description="Ảnh đầu tiên sẽ được dùng làm ảnh bìa. Hỗ trợ PNG, JPG."
            title="Hình ảnh nhà hàng"
          >
            {form.photos.length < MAX_PHOTOS ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-layer-line bg-layer p-8 text-center hover:border-primary-line">
                <span className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground-2">
                  <RestaurantIcon className="size-5" name="upload" />
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
                      alt={`Ảnh nhà hàng ${index + 1}`}
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
                      <RestaurantIcon className="size-3.5" name="x" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        ) : null}

        {currentStep === 3 ? (
          <>
            {form.menu.map((item, index) => (
              <Card
                action={
                  form.menu.length > 1 ? (
                    <button
                      className={destructiveTextButtonClass}
                      onClick={() => removeMenuItem(index)}
                      type="button"
                    >
                      <RestaurantIcon className="size-3.5" name="trash" />
                      Xóa món này
                    </button>
                  ) : null
                }
                key={index}
                title={`Món ${index + 1}${item.name ? ` · ${item.name}` : ""}`}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Tên món {requiredMark}</label>
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
                    <label className={labelClass}>Giá {requiredMark}</label>
                    <div className="relative">
                      <input
                        className={`${inputClass} pe-16`}
                        min={0}
                        onChange={(event) =>
                          updateMenuItem(index, "price", event.target.value)
                        }
                        placeholder="VD: 350000"
                        type="number"
                        value={item.price}
                      />
                      <div className="pointer-events-none absolute inset-y-0 end-0 z-20 flex items-center pe-4">
                        <span className="text-sm text-muted-foreground-1">
                          VND
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Mô tả món</label>
                  <textarea
                    className={textareaClass}
                    onChange={(event) =>
                      updateMenuItem(index, "description", event.target.value)
                    }
                    placeholder="Mô tả nguyên liệu, cách chế biến, khẩu phần..."
                    rows={2}
                    value={item.description}
                  />
                </div>
              </Card>
            ))}
            <button
              className={dashedButtonClass}
              onClick={addMenuItem}
              type="button"
            >
              <RestaurantIcon name="plus" />
              Thêm món mới
            </button>
          </>
        ) : null}

        {currentStep === 4 ? (
          <Card
            action={
              <span className={countBadgeClass}>
                {form.timeSlots.length} khung giờ
              </span>
            }
            description="Chọn khung giờ có sẵn, hoặc chọn một khoảng thời gian để hệ thống tự động chọn các khung giờ khả thi."
            title="Khung giờ phục vụ"
          >
            <div className="rounded-lg border border-layer-line bg-surface p-4">
              <span className={labelClass}>Chọn theo khoảng thời gian</span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <div>
                  <label
                    className="mb-1 block text-xs text-muted-foreground-1"
                    htmlFor="rangeStart"
                  >
                    Từ
                  </label>
                  <select
                    className={selectClass}
                    id="rangeStart"
                    onChange={(event) => setRangeStart(event.target.value)}
                    value={rangeStart}
                  >
                    {TIME_BOUNDARIES.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="mb-1 block text-xs text-muted-foreground-1"
                    htmlFor="rangeEnd"
                  >
                    Đến
                  </label>
                  <select
                    className={selectClass}
                    id="rangeEnd"
                    onChange={(event) => setRangeEnd(event.target.value)}
                    value={rangeEnd}
                  >
                    {TIME_BOUNDARIES.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className={primaryButtonClass}
                  disabled={rangeStart >= rangeEnd}
                  onClick={() => applyRange(rangeStart, rangeEnd)}
                  type="button"
                >
                  Áp dụng khoảng giờ
                </button>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="block text-sm font-medium text-foreground">
                  Khung giờ cố định (bước 30 phút) {requiredMark}
                </span>
                {form.timeSlots.length > 0 ? (
                  <button
                    className={destructiveTextButtonClass}
                    onClick={() => update("timeSlots", [])}
                    type="button"
                  >
                    Bỏ chọn tất cả
                  </button>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {FIXED_TIME_SLOTS.map((slot) => {
                  const selected = form.timeSlots.some(
                    (s) => s.startTime === slot.startTime
                  );
                  return (
                    <button
                      aria-pressed={selected}
                      className={chipClass(selected)}
                      key={slot.startTime}
                      onClick={() => toggleTimeSlot(slot)}
                      type="button"
                    >
                      {selected ? (
                        <RestaurantIcon className="size-3" name="tick" />
                      ) : null}
                      {slot.startTime} - {slot.endTime}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        ) : null}

        {isPreviewStep ? (
          <RestaurantDetailPreview
            form={form}
            provinceName={selectedProvince?.name}
            tagNames={selectedTagNames}
          />
        ) : null}

        <div className="flex items-center justify-between gap-x-2 rounded-xl border border-card-line bg-card px-4 py-3 shadow-2xs md:px-5">
          {isFirst ? (
            <Link className={layerButtonClass} href="/provider/restaurants">
              Hủy thao tác
            </Link>
          ) : (
            <button className={layerButtonClass} onClick={prev} type="button">
              <RestaurantIcon name="chevronLeft" />
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
            {isLast ? null : <RestaurantIcon name="chevronRight" />}
          </button>
        </div>
      </div>
    </div>
  );
}
