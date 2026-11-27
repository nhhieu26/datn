import { prisma } from "@/lib/prisma";
import {
  CUSTOMER_CANCEL_CUTOFF_HOURS,
  RESTAURANT_CANCEL_CUTOFF_HOURS,
} from "@/lib/utils";
import type {
  OperationalSettingsInput,
  PlatformInfoInput,
  SystemSettings,
} from "./type";

const SETTING_ID = "default";

export function getDefaultSystemSettings(): SystemSettings {
  const envCommission = Number(process.env.PLATFORM_COMMISSION_RATE ?? 0.1);
  const envUsdRate = Number(process.env.PAYPAL_USD_RATE ?? 25_000);
  const envHoldMinutes = Number(process.env.BOOKING_HOLD_MINUTES ?? 10);

  return {
    commissionRate: Number.isFinite(envCommission) ? envCommission : 0.1,
    usdRate:
      Number.isFinite(envUsdRate) && envUsdRate > 0 ? envUsdRate : 25_000,
    bookingHoldMinutes:
      Number.isFinite(envHoldMinutes) && envHoldMinutes > 0
        ? Math.round(envHoldMinutes)
        : 10,
    customerCancelCutoffHours: CUSTOMER_CANCEL_CUTOFF_HOURS,
    restaurantCancelCutoffHours: RESTAURANT_CANCEL_CUTOFF_HOURS,
    serviceDeleteGraceDays: 30,
    platformName: "Roamly",
    tagline:
      "Người bạn đồng hành du lịch toàn diện cho khách sạn, nhà hàng, tour và những điểm đến khó quên.",
    contactAddress: "70/A Tầng Divo Tower, Hà Nội, Việt Nam",
    contactPhone: "(+84) 123 456 789",
    contactEmail: "hello@roamly.vn",
    aboutVideoUrl: "",
    aboutVideoPosterUrl: "",
    updatedAt: null,
  };
}

function toSystemSettings(row: {
  commissionRate: { toNumber?: () => number } | number | string;
  usdRate: { toNumber?: () => number } | number | string;
  bookingHoldMinutes: number;
  customerCancelCutoffHours: number;
  restaurantCancelCutoffHours: number;
  serviceDeleteGraceDays: number;
  platformName: string;
  tagline: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  aboutVideoUrl: string;
  aboutVideoPosterUrl: string;
  updatedAt: Date;
}): SystemSettings {
  return {
    commissionRate: Number(row.commissionRate),
    usdRate: Number(row.usdRate),
    bookingHoldMinutes: row.bookingHoldMinutes,
    customerCancelCutoffHours: row.customerCancelCutoffHours,
    restaurantCancelCutoffHours: row.restaurantCancelCutoffHours,
    serviceDeleteGraceDays: row.serviceDeleteGraceDays,
    platformName: row.platformName,
    tagline: row.tagline,
    contactAddress: row.contactAddress,
    contactPhone: row.contactPhone,
    contactEmail: row.contactEmail,
    aboutVideoUrl: row.aboutVideoUrl,
    aboutVideoPosterUrl: row.aboutVideoPosterUrl,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getSettings(): Promise<SystemSettings> {
  const defaults = getDefaultSystemSettings();
  try {
    const row = await prisma.systemSetting.findUnique({
      where: { id: SETTING_ID },
    });
    if (!row) return defaults;
    return toSystemSettings(row);
  } catch (error) {
    console.warn(
      "[systemSettingRepo.getSettings] fallback to defaults:",
      error,
    );
    return defaults;
  }
}

export async function updateOperationalSettings(
  input: OperationalSettingsInput,
): Promise<SystemSettings> {
  const defaults = getDefaultSystemSettings();
  const commissionRate = Number((input.commissionPercent / 100).toFixed(4));
  const data = {
    commissionRate,
    usdRate: input.usdRate,
    bookingHoldMinutes: input.bookingHoldMinutes,
    customerCancelCutoffHours: input.customerCancelCutoffHours,
    restaurantCancelCutoffHours: input.restaurantCancelCutoffHours,
    serviceDeleteGraceDays: input.serviceDeleteGraceDays,
  };

  const row = await prisma.systemSetting.upsert({
    where: { id: SETTING_ID },
    create: {
      id: SETTING_ID,
      platformName: defaults.platformName,
      tagline: defaults.tagline,
      contactAddress: defaults.contactAddress,
      contactPhone: defaults.contactPhone,
      contactEmail: defaults.contactEmail,
      aboutVideoUrl: defaults.aboutVideoUrl,
      aboutVideoPosterUrl: defaults.aboutVideoPosterUrl,
      ...data,
    },
    update: data,
  });

  return toSystemSettings(row);
}

export async function resetOperationalSettings(): Promise<SystemSettings> {
  const defaults = getDefaultSystemSettings();
  return updateOperationalSettings({
    commissionPercent: Number((defaults.commissionRate * 100).toFixed(2)),
    usdRate: defaults.usdRate,
    bookingHoldMinutes: defaults.bookingHoldMinutes,
    customerCancelCutoffHours: defaults.customerCancelCutoffHours,
    restaurantCancelCutoffHours: defaults.restaurantCancelCutoffHours,
    serviceDeleteGraceDays: defaults.serviceDeleteGraceDays,
  });
}

export async function updatePlatformInfo(
  input: PlatformInfoInput,
): Promise<SystemSettings> {
  const defaults = getDefaultSystemSettings();
  const data = {
    platformName: input.platformName,
    tagline: input.tagline,
    contactAddress: input.contactAddress,
    contactPhone: input.contactPhone,
    contactEmail: input.contactEmail,
    aboutVideoUrl: input.aboutVideoUrl,
    aboutVideoPosterUrl: input.aboutVideoPosterUrl,
  };

  const row = await prisma.systemSetting.upsert({
    where: { id: SETTING_ID },
    create: {
      id: SETTING_ID,
      commissionRate: defaults.commissionRate,
      usdRate: defaults.usdRate,
      bookingHoldMinutes: defaults.bookingHoldMinutes,
      customerCancelCutoffHours: defaults.customerCancelCutoffHours,
      restaurantCancelCutoffHours: defaults.restaurantCancelCutoffHours,
      serviceDeleteGraceDays: defaults.serviceDeleteGraceDays,
      ...data,
    },
    update: data,
  });

  return toSystemSettings(row);
}
