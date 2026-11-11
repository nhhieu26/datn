import { z } from "zod";
import { parseVideoUrl } from "@/shared/lib/parse-video-url";

export const operationalSettingsSchema = z.object({
  commissionPercent: z.coerce
    .number({ message: "Tỉ lệ hoa hồng phải là số hợp lệ" })
    .min(0, "Tỉ lệ hoa hồng không được âm")
    .max(50, "Tỉ lệ hoa hồng không vượt quá 50%"),
  usdRate: z.coerce
    .number({ message: "Tỉ giá USD phải là số hợp lệ" })
    .min(1000, "Tỉ giá tối thiểu 1.000 VND/USD")
    .max(1000000, "Tỉ giá không vượt quá 1.000.000 VND/USD"),
  bookingHoldMinutes: z.coerce
    .number({ message: "Thời gian giữ chỗ phải là số nguyên" })
    .int("Thời gian giữ chỗ phải là số nguyên")
    .min(1, "Thời gian giữ chỗ tối thiểu 1 phút")
    .max(120, "Thời gian giữ chỗ tối đa 120 phút"),
  customerCancelCutoffHours: z.coerce
    .number({ message: "Thời hạn hủy đơn phải là số nguyên" })
    .int("Thời hạn hủy đơn phải là số nguyên")
    .min(0, "Thời hạn hủy đơn không được âm")
    .max(720, "Thời hạn hủy đơn tối đa 720 giờ (30 ngày)"),
  restaurantCancelCutoffHours: z.coerce
    .number({ message: "Thời hạn hủy đặt bàn phải là số nguyên" })
    .int("Thời hạn hủy đặt bàn phải là số nguyên")
    .min(0, "Thời hạn hủy đặt bàn không được âm")
    .max(168, "Thời hạn hủy đặt bàn tối đa 168 giờ (7 ngày)"),
  serviceDeleteGraceDays: z.coerce
    .number({ message: "Số ngày chờ xóa dịch vụ phải là số nguyên" })
    .int("Số ngày chờ xóa dịch vụ phải là số nguyên")
    .min(1, "Số ngày chờ xóa tối thiểu 1 ngày")
    .max(365, "Số ngày chờ xóa tối đa 365 ngày"),
});

export const platformInfoSchema = z.object({
  platformName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên hiển thị của nền tảng")
    .max(100, "Tên nền tảng tối đa 100 ký tự"),
  tagline: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mô tả ngắn của nền tảng")
    .max(300, "Mô tả ngắn tối đa 300 ký tự"),
  contactAddress: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập địa chỉ liên hệ")
    .max(250, "Địa chỉ liên hệ tối đa 250 ký tự"),
  contactPhone: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số điện thoại hotline")
    .max(50, "Số điện thoại tối đa 50 ký tự"),
  contactEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email hỗ trợ không hợp lệ")
    .max(120, "Email hỗ trợ tối đa 120 ký tự"),
  aboutVideoUrl: z
    .string()
    .trim()
    .max(500, "Link video tối đa 500 ký tự")
    .refine(
      (v) => v === "" || parseVideoUrl(v) !== null,
      "Link video phải là YouTube, Vimeo hoặc file .mp4/.webm (https://...)",
    ),
  aboutVideoPosterUrl: z
    .string()
    .trim()
    .max(500, "Link ảnh bìa tối đa 500 ký tự")
    .refine(
      (v) => v === "" || /^(https?:\/\/|\/(?!\/)).+/i.test(v),
      "Link ảnh bìa phải bắt đầu bằng http://, https:// hoặc / (ảnh trong thư mục public, vd: /beach.jpg)",
    ),
});
