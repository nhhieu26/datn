"use client";

import { useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { SettingsTabId, SystemSettingsPageData } from "../types";
import { AdminAccountTab } from "./admin-account-tab";
import { CategoriesSettingsTab } from "./categories-settings-tab";
import { OperationalSettingsTab } from "./operational-settings-tab";
import { PlatformInfoTab } from "./platform-info-tab";
import { SettingsToast } from "./settings-shared";

const TABS: {
  id: SettingsTabId;
  label: string;
  badge?: (d: SystemSettingsPageData) => string;
}[] = [
  {
    id: "operational",
    label: "Vận hành & Thanh toán",
  },
  {
    id: "categories",
    label: "Danh mục hệ thống",
    badge: (d) => `${d.tags.length + d.provinces.length}`,
  },
  {
    id: "platform",
    label: "Thông tin nền tảng",
  },
  {
    id: "account",
    label: "Tài khoản Quản trị",
  },
];

export function SystemSettingsDashboard({
  initialData,
}: {
  initialData: SystemSettingsPageData;
}) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("operational");
  const [settings, setSettings] = useState(initialData.settings);
  const [tags, setTags] = useState(initialData.tags);
  const [provinces, setProvinces] = useState(initialData.provinces);
  const [adminProfile, setAdminProfile] = useState(initialData.adminProfile);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  const notify = (
    message: string,
    variant: "success" | "error" = "success",
  ) => {
    setToast({ message, variant });
  };

  const currentData: SystemSettingsPageData = {
    settings,
    tags,
    provinces,
    adminProfile,
  };

  const commissionPercent = Number((settings.commissionRate * 100).toFixed(2));

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        {toast && (
          <SettingsToast
            message={toast.message}
            variant={toast.variant}
            onClose={() => setToast(null)}
          />
        )}

        {/* Tiêu đề trang */}
        <div className="grid gap-3 md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Cấu hình hệ thống
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
              Quản lý các tham số vận hành đặt chỗ, hoa hồng sàn, danh mục thẻ &
              tỉnh/thành phố, thông tin liên hệ và bảo mật tài khoản quản trị.
            </p>
          </div>
          <div className="text-xs text-muted-foreground-1">
            {settings.updatedAt
              ? `Cập nhật lần cuối: ${formatDateTime(settings.updatedAt)}`
              : "Đang sử dụng cấu hình mặc định hệ thống"}
          </div>
        </div>

        {/* Thẻ tóm tắt nhanh (Summary Cards) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col rounded-xl border border-card-line bg-card p-4 shadow-2xs md:p-5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
              Hoa hồng sàn hiện hành
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {commissionPercent}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground-1">
              Đối tác nhận {100 - commissionPercent}% giá trị đơn
            </p>
          </div>

          <div className="flex flex-col rounded-xl border border-card-line bg-card p-4 shadow-2xs md:p-5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
              Tỉ giá PayPal (USD)
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {formatCurrency(settings.usdRate)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground-1">
              Giữ chỗ {settings.bookingHoldMinutes} phút chờ thanh toán
            </p>
          </div>

          <div className="flex flex-col rounded-xl border border-card-line bg-card p-4 shadow-2xs md:p-5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
              Chính sách hủy & xóa
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {settings.customerCancelCutoffHours}h /{" "}
              {settings.restaurantCancelCutoffHours}h
            </p>
            <p className="mt-1 text-xs text-muted-foreground-1">
              Xóa mềm dịch vụ sau {settings.serviceDeleteGraceDays} ngày
            </p>
          </div>

          <div className="flex flex-col rounded-xl border border-card-line bg-card p-4 shadow-2xs md:p-5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
              Danh mục hệ thống
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {tags.length} Thẻ · {provinces.length} Tỉnh/TP
            </p>
            <p className="mt-1 text-xs text-muted-foreground-1">
              Phân loại cho Tour, Khách sạn, Nhà hàng, Điểm đến
            </p>
          </div>
        </div>

        {/* Thanh điều hướng Tabs (Preline - underline tabs) */}
        <div className="border-b border-line-2">
          <nav
            className="-mb-px flex gap-x-6 overflow-x-auto"
            aria-label="Tabs cấu hình hệ thống"
            role="tablist"
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const badgeText = tab.badge?.(currentData);
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-x-2 border-b-2 px-1 py-4 text-sm whitespace-nowrap focus:outline-hidden ${
                    active
                      ? "border-primary font-medium text-primary"
                      : "border-transparent text-muted-foreground-1 hover:text-primary-hover focus:text-primary-focus"
                  }`}
                >
                  {tab.label}
                  {badgeText && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface text-surface-foreground"
                      }`}
                    >
                      {badgeText}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Nội dung Tab đang chọn */}
        {activeTab === "operational" && (
          <OperationalSettingsTab
            settings={settings}
            onSettingsUpdated={setSettings}
            onNotify={notify}
          />
        )}

        {activeTab === "categories" && (
          <CategoriesSettingsTab
            tags={tags}
            provinces={provinces}
            onTagsChange={setTags}
            onProvincesChange={setProvinces}
            onNotify={notify}
          />
        )}

        {activeTab === "platform" && (
          <PlatformInfoTab
            settings={settings}
            onSettingsUpdated={setSettings}
            onNotify={notify}
          />
        )}

        {activeTab === "account" && (
          <AdminAccountTab
            adminProfile={adminProfile}
            onProfileUpdated={setAdminProfile}
            onNotify={notify}
          />
        )}
      </div>
    </main>
  );
}
