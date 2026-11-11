"use client";

import { useState, useTransition } from "react";
import type { SystemSettings } from "@/entities/system-setting";
import { savePlatformInfoAction } from "../actions";
import {
  FieldError,
  getActionErrorMessage,
  inputClass,
  primaryButtonClass,
  labelClass,
} from "./settings-shared";

export function PlatformInfoTab({
  settings,
  onSettingsUpdated,
  onNotify,
}: {
  settings: SystemSettings;
  onSettingsUpdated: (next: SystemSettings) => void;
  onNotify: (message: string, variant?: "success" | "error") => void;
}) {
  const [platformName, setPlatformName] = useState(settings.platformName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [contactAddress, setContactAddress] = useState(settings.contactAddress);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [aboutVideoUrl, setAboutVideoUrl] = useState(settings.aboutVideoUrl);
  const [aboutVideoPosterUrl, setAboutVideoPosterUrl] = useState(
    settings.aboutVideoPosterUrl,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    startTransition(async () => {
      const result = await savePlatformInfoAction({
        platformName,
        tagline,
        contactAddress,
        contactPhone,
        contactEmail,
        aboutVideoUrl,
        aboutVideoPosterUrl,
      });
      if (result.status === "error" || !result.data) {
        setFieldErrors(result.fieldErrors ?? {});
        onNotify(getActionErrorMessage(result), "error");
        return;
      }
      onSettingsUpdated(result.data);
      onNotify("Đã lưu thông tin liên hệ nền tảng và đồng bộ ra trang chủ.");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        <section className="rounded-xl border border-card-line bg-card p-5 shadow-2xs sm:p-6">
          <div className="border-b border-card-line pb-4">
            <h2 className="text-base font-semibold text-foreground">
              Thông tin hiển thị & Liên hệ nền tảng
            </h2>
            <p className="mt-1 text-sm text-muted-foreground-1">
              Dữ liệu này được hiển thị trực tiếp ở phần chân trang (Footer)
              trên giao diện khách hàng.
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="platformName" className={labelClass}>
                Tên hiển thị nền tảng
              </label>
              <input
                id="platformName"
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                disabled={isPending}
                className={`${inputClass}`}
              />
              <FieldError errors={fieldErrors.platformName} />
            </div>

            <div>
              <label htmlFor="tagline" className={labelClass}>
                Khẩu hiệu / Mô tả ngắn (Tagline)
              </label>
              <textarea
                id="tagline"
                rows={3}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                disabled={isPending}
                className={`${inputClass}`}
              />
              <FieldError errors={fieldErrors.tagline} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contactPhone" className={labelClass}>
                  Hotline hỗ trợ
                </label>
                <input
                  id="contactPhone"
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  disabled={isPending}
                  className={`${inputClass}`}
                />
                <FieldError errors={fieldErrors.contactPhone} />
              </div>

              <div>
                <label htmlFor="contactEmail" className={labelClass}>
                  Email hỗ trợ khách hàng
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  disabled={isPending}
                  className={`${inputClass}`}
                />
                <FieldError errors={fieldErrors.contactEmail} />
              </div>
            </div>

            <div>
              <label htmlFor="contactAddress" className={labelClass}>
                Địa chỉ trụ sở / văn phòng
              </label>
              <input
                id="contactAddress"
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                disabled={isPending}
                className={`${inputClass}`}
              />
              <FieldError errors={fieldErrors.contactAddress} />
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-card-line pt-4">
            <button
              type="submit"
              disabled={isPending}
              className={primaryButtonClass}
            >
              {isPending ? "Đang lưu..." : "Lưu thông tin nền tảng"}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-card-line bg-card p-5 shadow-2xs sm:p-6">
          <div className="border-b border-card-line pb-4">
            <h2 className="text-base font-semibold text-foreground">
              Video giới thiệu (Trang chủ)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground-1">
              Hiển thị ở mục &ldquo;Trải nghiệm thế giới cùng Roamly&rdquo;. Để
              trống link video để ẩn nút phát.
            </p>
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="aboutVideoUrl" className={labelClass}>
                Link video (YouTube, Vimeo hoặc file .mp4/.webm)
              </label>
              <input
                id="aboutVideoUrl"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={aboutVideoUrl}
                onChange={(e) => setAboutVideoUrl(e.target.value)}
                disabled={isPending}
                className={inputClass}
              />
              <FieldError errors={fieldErrors.aboutVideoUrl} />
            </div>
            <div>
              <label htmlFor="aboutVideoPosterUrl" className={labelClass}>
                Link ảnh bìa (tuỳ chọn)
              </label>
              <input
                id="aboutVideoPosterUrl"
                type="text"
                placeholder="https://... hoặc /beach.jpg"
                value={aboutVideoPosterUrl}
                onChange={(e) => setAboutVideoPosterUrl(e.target.value)}
                disabled={isPending}
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-muted-foreground-1">
                Nhập link ảnh hoặc đường dẫn trong thư mục public (vd:
                /beach.jpg). Để trống sẽ tự lấy ảnh bìa từ video.
              </p>
              <FieldError errors={fieldErrors.aboutVideoPosterUrl} />
            </div>
          </div>
          <div className="mt-6 flex justify-end border-t border-card-line pt-4">
            <button
              type="submit"
              disabled={isPending}
              className={primaryButtonClass}
            >
              {isPending ? "Đang lưu..." : "Lưu thông tin nền tảng"}
            </button>
          </div>
        </section>
      </div>

      {/* Khung xem trước Footer */}
      <div className="lg:col-span-5">
        <aside className="rounded-xl border border-card-line bg-card p-5 shadow-2xs sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Xem trước khối Chân trang (Footer)
            </h3>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              Live Preview
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-layer-line bg-surface p-5 text-muted-foreground-1">
            <div className="border-b border-layer-line pb-4">
              <div className="text-xs font-semibold tracking-wider text-muted-foreground-1 uppercase">
                Liên hệ
              </div>
              <div className="mt-2.5 space-y-2 text-sm">
                <p className="leading-relaxed text-foreground">
                  {contactAddress || "—"}
                </p>
                <p className="font-medium text-primary">
                  {contactPhone || "—"}
                </p>
                <p className="text-muted-foreground-1">{contactEmail || "—"}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-card-line bg-card p-4 text-foreground shadow-2xs">
              <div className="text-base font-bold text-foreground">
                {platformName || "Roamly"}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground-1">
                {tagline || "—"}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground-1">
              <span>© 2026 {platformName || "Roamly"}. Bảo lưu mọi quyền.</span>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
