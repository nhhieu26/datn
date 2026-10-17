"use client";

import type { BusinessType } from "@/generated/prisma/client";
import Link from "next/link";
import {
  useActionState,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import {
  createProviderProfileAction,
  updateProviderProfileAction,
  type CreateProfileActionState,
} from "../actions";
import { ProfileIcon, type ProfileIconName } from "./profile-icon";

const MAX_DESCRIPTION_LENGTH = 1000;

const INITIAL_STATE: CreateProfileActionState = { status: "idle" };

const serviceOptions: {
  value: BusinessType;
  label: string;
  hint: string;
  icon: ProfileIconName;
}[] = [
  {
    value: "tour",
    label: "Tour du lịch",
    hint: "Trải nghiệm khám phá, lữ hành & tour bản địa",
    icon: "map",
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
    icon: "utensils",
  },
];

const inputClass =
  "block w-full rounded-lg border-layer-line bg-layer px-3 py-2 text-foreground placeholder:text-muted-foreground-1 focus:border-primary-focus focus:ring-primary-focus disabled:pointer-events-none disabled:opacity-50 sm:text-sm";
const iconInputClass = `${inputClass} ps-10`;
const labelClass = "mb-2 block text-sm font-medium text-foreground";

const layerButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer px-3 py-2 text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

const PAYPAL_STATUS_MESSAGES: Record<
  string,
  { text: string; icon: ProfileIconName; className: string }
> = {
  linked: {
    text: "Liên kết PayPal thành công.",
    icon: "check",
    className: "border-teal-200 bg-teal-50 text-teal-800",
  },
  cancelled: {
    text: "Bạn đã hủy liên kết PayPal.",
    icon: "alert",
    className: "border-yellow-200 bg-yellow-50 text-yellow-800",
  },
  unverified: {
    text: "Tài khoản PayPal chưa được xác minh nên không thể liên kết.",
    icon: "x",
    className: "border-red-200 bg-red-50 text-red-800",
  },
  error: {
    text: "Không thể liên kết PayPal. Vui lòng thử lại.",
    icon: "x",
    className: "border-red-200 bg-red-50 text-red-800",
  },
};

function Required() {
  return <span className="text-red-500">*</span>;
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-2 text-xs text-red-600">{errors[0]}</p>;
}

function Alert({
  icon,
  className,
  children,
}: {
  icon: ProfileIconName;
  className: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex rounded-lg border p-4 text-sm ${className}`}
      role="alert"
    >
      <ProfileIcon name={icon} className="mt-0.5 size-4" />
      <div className="ms-3">{children}</div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-5 rounded-xl border border-card-line bg-card p-4 shadow-2xs sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground-1">{description}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function IconInput({
  icon,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  icon: ProfileIconName;
  error?: string[];
}) {
  return (
    <>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 start-0 z-20 flex items-center ps-3.5">
          <ProfileIcon name={icon} className="size-4 text-muted-foreground" />
        </div>
        <input className={iconInputClass} {...props} />
      </div>
      <FieldError errors={error} />
    </>
  );
}

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
  paypal,
  paypalStatus,
}: {
  mode: "create" | "edit";
  availableBusinessTypes: BusinessType[];
  initialValues?: ProfileFormValues;
  profileId?: string;
  rejection?: { reason: string; timestamp: string };
  paypal: { email: string; linkedAt: string } | null;
  paypalStatus?: string;
}) {
  const isEdit = mode === "edit";
  const action = isEdit
    ? updateProviderProfileAction.bind(null, profileId!)
    : createProviderProfileAction;
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const [businessType, setBusinessType] = useState<BusinessType>(
    initialValues?.businessType ?? availableBusinessTypes[0],
  );
  const [descriptionLength, setDescriptionLength] = useState(
    initialValues?.description.length ?? 0,
  );
  const [logoPreview, setLogoPreview] = useState(initialValues?.logo ?? "");
  const [removeLogo, setRemoveLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleServiceOptions = serviceOptions.filter((option) =>
    availableBusinessTypes.includes(option.value),
  );
  const paypalMessage = paypalStatus
    ? PAYPAL_STATUS_MESSAGES[paypalStatus]
    : undefined;
  const errors = state.fieldErrors;
  const paypalConnectHref = profileId
    ? `/api/paypal/connect?profileId=${profileId}`
    : "/api/paypal/connect";

  return (
    <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Page header */}
      <div className="grid gap-3 md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isEdit ? "Chỉnh sửa hồ sơ doanh nghiệp" : "Tạo hồ sơ doanh nghiệp"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
            {isEdit
              ? "Cập nhật thông tin pháp lý và thương hiệu, sau đó gửi lại để Roamly thẩm định."
              : "Cung cấp thông tin pháp lý và thương hiệu để Roamly thẩm định trước khi bạn bắt đầu kinh doanh trên nền tảng."}
          </p>
        </div>
        <Link
          className={`shrink-0 self-start md:self-auto ${layerButtonClass}`}
          href="/provider/profiles"
        >
          <ProfileIcon name="arrowLeft" />
          Quay lại danh sách
        </Link>
      </div>

      {isEdit && rejection ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <div className="flex">
            <ProfileIcon name="alert" className="mt-0.5 size-4" />
            <div className="ms-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="font-semibold">
                  Lý do bị từ chối phê duyệt hồ sơ
                </h3>
                <span className="inline-flex items-center gap-x-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium">
                  <ProfileIcon name="clock" className="size-3" />
                  {rejection.timestamp}
                </span>
              </div>
              <p className="mt-1 text-red-700">{rejection.reason}</p>
            </div>
          </div>
        </div>
      ) : null}

      <form action={formAction} className="space-y-4 sm:space-y-6">
        {state.status === "error" && state.formError ? (
          <Alert icon="x" className="border-red-200 bg-red-50 text-red-800">
            {state.formError}
          </Alert>
        ) : null}

        <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            {/* Tài khoản PayPal */}
            <Section
              description="Roamly chuyển tiền thanh toán của khách vào tài khoản này. Hãy liên kết trước khi điền thông tin bên dưới."
              title="Tài khoản nhận tiền"
            >
              {paypalMessage ? (
                <Alert
                  className={paypalMessage.className}
                  icon={paypalMessage.icon}
                >
                  {paypalMessage.text}
                </Alert>
              ) : null}
              <div>
                <span className={labelClass}>
                  Tài khoản PayPal <Required />
                </span>
                <div className="flex flex-col gap-4 rounded-lg border border-layer-line bg-layer p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-x-3">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                        paypal
                          ? "bg-teal-100 text-teal-700"
                          : "bg-surface text-surface-foreground"
                      }`}
                    >
                      <ProfileIcon
                        className="size-5"
                        name={paypal ? "shieldCheck" : "wallet"}
                      />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {paypal
                          ? paypal.email
                          : "Chưa liên kết tài khoản PayPal"}
                      </p>
                      <p className="text-xs text-muted-foreground-1">
                        {paypal
                          ? `Đã liên kết ngày ${new Date(paypal.linkedAt).toLocaleDateString("vi-VN")}`
                          : "Bắt buộc để gửi hồ sơ thẩm định."}
                      </p>
                    </div>
                  </div>
                  {/* Route handler redirect sang PayPal → dùng <a>, không dùng next/link */}
                  <a
                    className={`shrink-0 ${paypal ? layerButtonClass : primaryButtonClass}`}
                    href={paypalConnectHref}
                  >
                    <ProfileIcon name="link" />
                    {paypal ? "Đổi tài khoản PayPal" : "Liên kết với PayPal"}
                  </a>
                </div>
                <FieldError errors={errors?.paypal} />
              </div>
            </Section>

            {/* Thông tin doanh nghiệp */}
            <Section
              description="Thông tin pháp nhân hiển thị với khách hàng và dùng cho việc đối soát thuế."
              title="Thông tin doanh nghiệp"
            >
              <div>
                <label className={labelClass} htmlFor="businessName">
                  Tên công ty / Doanh nghiệp <Required />
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
                <FieldError errors={errors?.businessName} />
              </div>

              <div>
                <span className={labelClass}>
                  Loại hình doanh nghiệp <Required />
                </span>
                <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
                  {visibleServiceOptions.map((option) => {
                    const selected = businessType === option.value;
                    return (
                      <label
                        className={`flex w-full gap-x-3 rounded-lg border bg-layer p-3 text-sm ${
                          isEdit ? "cursor-not-allowed" : "cursor-pointer"
                        } ${
                          selected
                            ? "border-primary ring-1 ring-primary"
                            : "border-layer-line hover:bg-layer-hover"
                        }`}
                        htmlFor={`businessType-${option.value}`}
                        key={option.value}
                      >
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                            selected
                              ? "bg-primary-100 text-primary-700"
                              : "bg-surface text-surface-foreground"
                          }`}
                        >
                          <ProfileIcon name={option.icon} />
                        </span>
                        <span className="min-w-0 grow">
                          <span className="block font-semibold text-foreground">
                            {option.label}
                          </span>
                          <span className="block text-xs text-muted-foreground-1">
                            {option.hint}
                          </span>
                        </span>
                        <input
                          checked={selected}
                          className="mt-0.5 shrink-0 rounded-full border-line-3 bg-transparent text-primary checked:border-primary checked:bg-primary-checked focus:ring-primary-focus"
                          disabled={isEdit}
                          id={`businessType-${option.value}`}
                          name="businessType"
                          onChange={() => setBusinessType(option.value)}
                          type="radio"
                          value={option.value}
                        />
                      </label>
                    );
                  })}
                </div>
                {isEdit ? (
                  <p className="mt-2 text-xs text-muted-foreground-1">
                    Không thể thay đổi loại hình của hồ sơ đã tạo.
                  </p>
                ) : null}
                <FieldError errors={errors?.businessType} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="taxCode">
                    Mã số thuế (MST) <Required />
                  </label>
                  <IconInput
                    error={errors?.taxCode}
                    defaultValue={initialValues?.taxCode}
                    icon="receipt"
                    id="taxCode"
                    name="taxCode"
                    placeholder="VD: 0101234567"
                    required
                    type="text"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="address">
                    Địa chỉ trụ sở / kinh doanh <Required />
                  </label>
                  <IconInput
                    error={errors?.address}
                    defaultValue={initialValues?.address}
                    icon="mapPin"
                    id="address"
                    name="address"
                    placeholder="Nhập địa chỉ đăng ký kinh doanh..."
                    required
                    type="text"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-x-2">
                  <label
                    className="block text-sm font-medium text-foreground"
                    htmlFor="description"
                  >
                    Mô tả giới thiệu doanh nghiệp <Required />
                  </label>
                  <span className="text-xs text-muted-foreground-1">
                    {descriptionLength} / {MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
                <textarea
                  className={inputClass}
                  defaultValue={initialValues?.description}
                  id="description"
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  name="description"
                  onChange={(event) =>
                    setDescriptionLength(event.target.value.length)
                  }
                  placeholder="Viết đoạn giới thiệu hấp dẫn về doanh nghiệp của bạn, các giá trị cốt lõi và thế mạnh dịch vụ..."
                  required
                  rows={5}
                />
                <FieldError errors={errors?.description} />
              </div>
            </Section>

            {/* Pháp lý & liên kết */}
            <Section
              description="Tài liệu giúp đội ngũ Roamly xác minh năng lực kinh doanh nhanh hơn."
              title="Pháp lý & liên kết"
            >
              <div>
                <label className={labelClass} htmlFor="legalDocUrl">
                  Liên kết hồ sơ pháp lý / năng lực
                </label>
                <IconInput
                  aria-describedby="legalDocUrlHint"
                  defaultValue={initialValues?.legalDocUrl}
                  error={errors?.licenseUrl}
                  icon="link"
                  id="legalDocUrl"
                  name="legalDocUrl"
                  placeholder="https://drive.google.com/..."
                  type="url"
                />
                <p
                  className="mt-2 text-xs text-muted-foreground-1"
                  id="legalDocUrlHint"
                >
                  Dán liên kết Google Drive, Dropbox hoặc dịch vụ lưu trữ khác
                  và bật quyền xem cho bất kỳ ai có liên kết.
                </p>
              </div>
              <div>
                <label className={labelClass} htmlFor="websiteUrl">
                  Website chính thức
                </label>
                <IconInput
                  defaultValue={initialValues?.websiteUrl}
                  error={errors?.website}
                  icon="globe"
                  id="websiteUrl"
                  name="websiteUrl"
                  placeholder="https://baliexplorer.co"
                  type="url"
                />
              </div>
            </Section>
          </div>

          <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-6">
            {/* Ảnh đại diện */}
            <Section
              description="Hiển thị trên trang dịch vụ và kết quả tìm kiếm của khách hàng."
              title="Ảnh đại diện / Logo"
            >
              <div className="space-y-4">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="Ảnh đại diện"
                    className="aspect-square w-full rounded-lg border border-layer-line object-cover"
                    src={logoPreview}
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed border-line-2 bg-surface text-muted-foreground-2">
                    <ProfileIcon name="image" className="size-10" />
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {logoPreview
                        ? "Ảnh đại diện doanh nghiệp"
                        : "Chưa có ảnh đại diện"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground-1">
                      Khuyến nghị 1200 × 630 px hoặc ảnh vuông sắc nét (JPG, PNG
                      dưới 5MB).
                    </p>
                    <FieldError errors={errors?.logo} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className={`cursor-pointer ${layerButtonClass}`}>
                      <ProfileIcon name="upload" />
                      {logoPreview ? "Thay đổi ảnh" : "Tải ảnh lên"}
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
                      <input
                        name="removeLogo"
                        type="hidden"
                        value={removeLogo ? "true" : ""}
                      />
                    </label>
                    {logoPreview ? (
                      <button
                        className="inline-flex items-center gap-x-2 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-hidden"
                        onClick={() => {
                          setLogoPreview("");
                          setRemoveLogo(true);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        type="button"
                      >
                        <ProfileIcon name="trash" />
                        Xóa ảnh
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </Section>

            {/* Actions */}
            <div className="flex flex-col gap-3 rounded-xl border border-card-line bg-card p-4 shadow-2xs sm:p-6">
              <button
                className={primaryButtonClass}
                disabled={isPending || !paypal}
                type="submit"
              >
                <ProfileIcon name="send" />
                {isPending
                  ? "Đang xử lý..."
                  : isEdit
                    ? "Lưu & Gửi thẩm định lại"
                    : "Lưu & Gửi thẩm định"}
              </button>
              <Link className={layerButtonClass} href="/provider/profiles">
                Hủy bỏ
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
