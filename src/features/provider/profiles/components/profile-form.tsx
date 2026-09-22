"use client";

import type { BusinessType } from "@/generated/prisma/client";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import {
  createProviderProfileAction,
  updateProviderProfileAction,
  type CreateProfileActionState,
} from "../actions";

const MAX_DESCRIPTION_LENGTH = 1000;

const INITIAL_STATE: CreateProfileActionState = { status: "idle" };

const serviceOptions: {
  value: BusinessType;
  label: string;
  hint: string;
  icon: string;
}[] = [
  {
    value: "tour",
    label: "Tour du lịch",
    hint: "Trải nghiệm khám phá, lữ hành & tour bản địa",
    icon: "explore",
  },
  {
    value: "hotel",
    label: "Khách sạn & Lưu trú",
    hint: "Khu nghỉ dưỡng, homestay, villa cao cấp",
    icon: "bed",
  },
  {
    value: "restaurant",
    label: "Nhà hàng & Ẩm thực",
    hint: "Quán ăn đặc sản, ẩm thực bản địa & cafe",
    icon: "restaurant",
  },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none";
const iconInputClass = `${inputClass} !pl-9`;
const labelClass = "block text-xs font-bold text-slate-700 mb-1.5";
const inputIconClass =
  "material-symbols-outlined pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-slate-400";
const fieldErrorClass = "mt-1 text-xs font-medium text-rose-500";

type ProfileFormValues = {
  businessName: string;
  businessType: BusinessType;
  taxCode: string;
  address: string;
  description: string;
  legalDocUrl: string;
  websiteUrl: string;
  logo: string;
};

export function ProfileForm({
  mode,
  availableBusinessTypes,
  initialValues,
  profileId,
  rejection,
}: {
  mode: "create" | "edit";
  availableBusinessTypes: BusinessType[];
  initialValues?: ProfileFormValues;
  profileId?: string;
  rejection?: { reason: string; timestamp: string };
}) {
  const action =
    mode === "create"
      ? createProviderProfileAction
      : updateProviderProfileAction.bind(null, profileId!);
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const [businessType, setBusinessType] = useState<BusinessType>(
    initialValues?.businessType ?? availableBusinessTypes[0]
  );
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [logoPreview, setLogoPreview] = useState(initialValues?.logo ?? "");
  const [removeLogo, setRemoveLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleServiceOptions = serviceOptions.filter((option) =>
    availableBusinessTypes.includes(option.value)
  );

  const descriptionLength = description.length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col space-y-6">
      {/* Page header */}
      <section className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Hồ sơ Doanh nghiệp
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Quản lý và cập nhật thông tin pháp lý, thương hiệu của bạn trên nền
          tảng Roamly.
        </p>
      </section>

      {/* Rejection alert (edit mode only) */}
      {mode === "edit" && rejection ? (
        <section className="rounded-2xl border border-red-200 bg-red-50/70 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 sm:flex-nowrap">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-2xs">
                <span className="material-symbols-outlined text-[20px]">
                  warning
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-bold leading-tight text-red-700">
                    Lý do bị từ chối phê duyệt hồ sơ
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100/70 px-2.5 py-0.5 text-xs font-semibold text-red-500">
                    <span className="material-symbols-outlined text-[12px]">
                      schedule
                    </span>
                    {rejection.timestamp}
                  </span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-red-600">
                  {rejection.reason}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Main form card */}
      <form
        action={formAction}
        className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm"
      >
        {state.status === "error" && state.formError ? (
          <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-[13px] font-medium text-rose-600">
            {state.formError}
          </p>
        ) : null}

        {/* Tên doanh nghiệp */}
        <div>
          <label className={labelClass} htmlFor="businessName">
            Tên công ty / Doanh nghiệp <span className="text-brand-500">*</span>
          </label>
          <input
            className={inputClass}
            defaultValue={initialValues?.businessName}
            id="businessName"
            name="businessName"
            placeholder="Nhập tên pháp nhân hoặc thương hiệu kinh doanh..."
            required
            type="text"
          />
          {state.fieldErrors?.businessName ? (
            <p className={fieldErrorClass}>
              {state.fieldErrors.businessName[0]}
            </p>
          ) : null}
        </div>

        {/* Loại hình doanh nghiệp */}
        <div>
          <label className="mb-2 block text-xs font-bold text-slate-700">
            Loại hình doanh nghiệp <span className="text-brand-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
            {visibleServiceOptions.map((option) => {
              const selected = businessType === option.value;
              return (
                <label
                  className={`relative flex items-center gap-3.5 rounded-xl border-2 p-4 transition-all ${
                    mode === "edit" ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                  } ${
                    selected
                      ? "border-brand-500 bg-brand-50/50 shadow-2xs"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                  key={option.value}
                >
                  <input
                    checked={selected}
                    className="sr-only"
                    disabled={mode === "edit"}
                    name="businessType"
                    onChange={() => setBusinessType(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      selected
                        ? "bg-brand-500 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {option.icon}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-bold ${
                        selected ? "text-slate-900" : "text-slate-800"
                      }`}
                    >
                      {option.label}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {option.hint}
                    </span>
                  </div>
                  {selected ? (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "10px" }}
                      >
                        check
                      </span>
                    </div>
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-slate-300" />
                  )}
                </label>
              );
            })}
          </div>
          {state.fieldErrors?.businessType ? (
            <p className={fieldErrorClass}>
              {state.fieldErrors.businessType[0]}
            </p>
          ) : null}
        </div>

        {/* MST + Địa chỉ */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="taxCode">
              Mã số thuế (MST) <span className="text-brand-500">*</span>
            </label>
            <div className="relative">
              <span className={inputIconClass}>receipt</span>
              <input
                className={iconInputClass}
                defaultValue={initialValues?.taxCode}
                id="taxCode"
                name="taxCode"
                placeholder="VD: 0101234567"
                required
                type="text"
              />
            </div>
            {state.fieldErrors?.taxCode ? (
              <p className={fieldErrorClass}>{state.fieldErrors.taxCode[0]}</p>
            ) : null}
          </div>
          <div>
            <label className={labelClass} htmlFor="address">
              Địa chỉ trụ sở / kinh doanh{" "}
              <span className="text-brand-500">*</span>
            </label>
            <div className="relative">
              <span className={inputIconClass}>location_on</span>
              <input
                className={iconInputClass}
                defaultValue={initialValues?.address}
                id="address"
                name="address"
                placeholder="Nhập địa chỉ đăng ký kinh doanh..."
                required
                type="text"
              />
            </div>
            {state.fieldErrors?.address ? (
              <p className={fieldErrorClass}>{state.fieldErrors.address[0]}</p>
            ) : null}
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700" htmlFor="description">
              Mô tả giới thiệu doanh nghiệp{" "}
              <span className="text-brand-500">*</span>
            </label>
            <span className="text-[11px] font-semibold text-slate-400">
              {descriptionLength} / {MAX_DESCRIPTION_LENGTH} ký tự
            </span>
          </div>
          <textarea
            className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-medium leading-relaxed text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
            defaultValue={initialValues?.description}
            id="description"
            maxLength={MAX_DESCRIPTION_LENGTH}
            name="description"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Viết đoạn giới thiệu hấp dẫn về doanh nghiệp của bạn, các giá trị cốt lõi và thế mạnh dịch vụ..."
            required
            rows={5}
          />
          {state.fieldErrors?.description ? (
            <p className={fieldErrorClass}>
              {state.fieldErrors.description[0]}
            </p>
          ) : null}
        </div>

        {/* Link hồ sơ + Website */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="legalDocUrl">
              Liên kết hồ sơ pháp lý / Năng lực (Google Drive, Dropbox...)
            </label>
            <div className="relative">
              <span className={inputIconClass}>link</span>
              <input
                className={iconInputClass}
                defaultValue={initialValues?.legalDocUrl}
                id="legalDocUrl"
                name="legalDocUrl"
                placeholder="https://drive.google.com/..."
                type="url"
              />
            </div>
            {state.fieldErrors?.licenseUrl ? (
              <p className={fieldErrorClass}>
                {state.fieldErrors.licenseUrl[0]}
              </p>
            ) : null}
          </div>
          <div>
            <label className={labelClass} htmlFor="websiteUrl">
              Website chính thức
            </label>
            <div className="relative">
              <span className={inputIconClass}>language</span>
              <input
                className={iconInputClass}
                defaultValue={initialValues?.websiteUrl}
                id="websiteUrl"
                name="websiteUrl"
                placeholder="https://baliexplorer.co"
                type="url"
              />
            </div>
            {state.fieldErrors?.website ? (
              <p className={fieldErrorClass}>{state.fieldErrors.website[0]}</p>
            ) : null}
          </div>
        </div>

        {/* Ảnh đại diện */}
        <div className="pt-2">
          <label className="mb-2 block text-xs font-bold text-slate-700">
            Ảnh đại diện / Logo doanh nghiệp
          </label>
          <div className="flex flex-col items-center gap-6 rounded-xl border border-slate-200 bg-slate-50/50 p-5 sm:flex-row">
            {logoPreview ? (
              <div className="group relative h-36 w-full shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner sm:w-60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Ảnh đại diện"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  src={logoPreview}
                />
                <button
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-rose-600 shadow-sm transition-colors hover:bg-white"
                  onClick={() => {
                    setLogoPreview("");
                    setRemoveLogo(true);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  title="Xóa hình ảnh này"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    delete
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex h-36 w-full shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100 sm:w-60">
                <span className="material-symbols-outlined text-[40px] text-slate-300">
                  image
                </span>
              </div>
            )}
            <div className="w-full space-y-2.5 text-center sm:text-left">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {logoPreview
                    ? "Ảnh đại diện doanh nghiệp đang hoạt động"
                    : "Chưa có ảnh đại diện"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Khuyến nghị tỷ lệ tiêu chuẩn: 1200 × 630 px hoặc ảnh vuông sắc
                  nét (định dạng JPG, PNG dưới 5MB).
                </p>
                {state.fieldErrors?.logo ? (
                  <p className={fieldErrorClass}>{state.fieldErrors.logo[0]}</p>
                ) : null}
              </div>
              <div className="flex items-center justify-center gap-2.5 pt-1 sm:justify-start">
                <label
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-100"
                  title="Tải hình ảnh lên"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-500">
                    upload
                  </span>
                  <span>
                    {logoPreview ? "Thay đổi hình ảnh" : "Tải hình ảnh lên"}
                  </span>
                  <input
                    accept="image/png,image/jpeg"
                    className="hidden"
                    name="logo"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        setLogoPreview(URL.createObjectURL(file));
                        setRemoveLogo(false);
                      }
                    }}
                    ref={fileInputRef}
                    type="file"
                  />
                </label>
              </div>
            </div>
          </div>
          <input
            name="removeLogo"
            type="hidden"
            value={removeLogo ? "true" : ""}
          />
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-500/25 transition-all hover:bg-brand-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              <span className="material-symbols-outlined text-[18px]">
                send
              </span>
              <span>
                {isPending
                  ? "Đang xử lý..."
                  : mode === "create"
                    ? "Lưu & Gửi thẩm định"
                    : "Lưu & Gửi thẩm định lại"}
              </span>
            </button>
          </div>
          <Link
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
            href="/provider/profiles"
          >
            Hủy bỏ
          </Link>
        </div>
      </form>
    </div>
  );
}
