"use client";

import type { BusinessType } from "@/generated/prisma/client";
import { useState } from "react";

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

const MAX_DESCRIPTION_LENGTH = 1000;

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

export function ProfileForm({
  mode,
  initialValues,
  rejection,
}: {
  mode: "create" | "edit";
  initialValues: ProfileFormValues;
  rejection?: { reason: string; timestamp: string };
}) {
  const [values, setValues] = useState(initialValues);
  const [logoUrl, setLogoUrl] = useState(initialValues.logo);

  const set = (field: keyof ProfileFormValues) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    let nextValue = event.target.value;
    if (field === "description") {
      nextValue = nextValue.slice(0, MAX_DESCRIPTION_LENGTH);
    }
    setValues((prev) => ({ ...prev, [field]: nextValue }));
  };

  const descriptionLength = values.description.length;

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
        className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm"
        onSubmit={(event) => event.preventDefault()}
      >
        {/* Tên doanh nghiệp */}
        <div>
          <label className={labelClass} htmlFor="businessName">
            Tên công ty / Doanh nghiệp <span className="text-brand-500">*</span>
          </label>
          <input
            className={inputClass}
            id="businessName"
            onChange={set("businessName")}
            placeholder="Nhập tên pháp nhân hoặc thương hiệu kinh doanh..."
            required
            type="text"
            value={values.businessName}
          />
        </div>

        {/* Loại hình doanh nghiệp */}
        <div>
          <label className="mb-2 block text-xs font-bold text-slate-700">
            Loại hình doanh nghiệp <span className="text-brand-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {serviceOptions.map((option) => {
              const selected = values.businessType === option.value;
              return (
                <label
                  className={`relative flex cursor-pointer items-center gap-3.5 rounded-xl border-2 p-4 transition-all ${
                    selected
                      ? "border-brand-500 bg-brand-50/50 shadow-2xs"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                  key={option.value}
                >
                  <input
                    checked={selected}
                    className="sr-only"
                    name="businessType"
                    onChange={() =>
                      setValues((prev) => ({
                        ...prev,
                        businessType: option.value,
                      }))
                    }
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
                id="taxCode"
                onChange={set("taxCode")}
                placeholder="VD: 0101234567"
                required
                type="text"
                value={values.taxCode}
              />
            </div>
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
                id="address"
                onChange={set("address")}
                placeholder="Nhập địa chỉ đăng ký kinh doanh..."
                required
                type="text"
                value={values.address}
              />
            </div>
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
            id="description"
            onChange={set("description")}
            placeholder="Viết đoạn giới thiệu hấp dẫn về doanh nghiệp của bạn, các giá trị cốt lõi và thế mạnh dịch vụ..."
            required
            rows={5}
            value={values.description}
          />
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
                id="legalDocUrl"
                onChange={set("legalDocUrl")}
                placeholder="https://drive.google.com/..."
                type="url"
                value={values.legalDocUrl}
              />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="websiteUrl">
              Website chính thức
            </label>
            <div className="relative">
              <span className={inputIconClass}>language</span>
              <input
                className={iconInputClass}
                id="websiteUrl"
                onChange={set("websiteUrl")}
                placeholder="https://baliexplorer.co"
                type="url"
                value={values.websiteUrl}
              />
            </div>
          </div>
        </div>

        {/* Ảnh đại diện */}
        <div className="pt-2">
          <label className="mb-2 block text-xs font-bold text-slate-700">
            Ảnh đại diện / Logo doanh nghiệp
          </label>
          <div className="flex flex-col items-center gap-6 rounded-xl border border-slate-200 bg-slate-50/50 p-5 sm:flex-row">
            {logoUrl ? (
              <div className="group relative h-36 w-full shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner sm:w-60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={values.businessName || "Ảnh đại diện"}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  src={logoUrl}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/60 via-black/20 to-transparent px-2 pb-2.5">
                  <span className="text-xs font-extrabold tracking-wide text-white uppercase drop-shadow">
                    {values.businessName || "Roamly"}
                  </span>
                </div>
                <button
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-rose-600 shadow-sm transition-colors hover:bg-white"
                  onClick={() => setLogoUrl("")}
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
                  {logoUrl
                    ? "Ảnh đại diện doanh nghiệp đang hoạt động"
                    : "Chưa có ảnh đại diện"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Khuyến nghị tỷ lệ tiêu chuẩn: 1200 × 630 px hoặc ảnh vuông sắc
                  nét (định dạng JPG, PNG dưới 5MB).
                </p>
              </div>
              <div className="flex items-center justify-center gap-2.5 pt-1 sm:justify-start">
                <label
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-100"
                  title="Tải hình ảnh lên"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-500">
                    upload
                  </span>
                  <span>{logoUrl ? "Thay đổi hình ảnh" : "Tải hình ảnh lên"}</span>
                  <input
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) setLogoUrl(URL.createObjectURL(file));
                    }}
                    type="file"
                    accept="image/png,image/jpeg"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-12">
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-500/25 transition-all hover:bg-brand-600 active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>
              {mode === "create" ? "Lưu & Gửi thẩm định" : "Lưu & Gửi thẩm định lại"}
            </span>
          </button>
        </div>
        <button
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          type="button"
        >
          Hủy bỏ
        </button>
      </div>
    </div>
  );
}
