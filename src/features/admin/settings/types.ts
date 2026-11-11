import type { ProvinceType } from "@/generated/prisma/client";
import type { SystemSettings } from "@/entities/system-setting";

export type SettingsTabId =
  | "operational"
  | "categories"
  | "platform"
  | "account";

export type UsageCounts = {
  tours: number;
  hotels: number;
  restaurants: number;
  destinations: number;
  total: number;
};

export type AdminTagItem = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  counts: UsageCounts;
};

export type AdminProvinceItem = {
  id: string;
  name: string;
  fullName: string;
  slug: string;
  type: ProvinceType;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  counts: UsageCounts;
};

export type AdminProfileData = {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  createdAt: string;
};

export type SystemSettingsPageData = {
  settings: SystemSettings;
  tags: AdminTagItem[];
  provinces: AdminProvinceItem[];
  adminProfile: AdminProfileData;
};
