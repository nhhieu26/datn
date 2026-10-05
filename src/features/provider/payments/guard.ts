import type { ProviderProfile } from "@/entities/provider-profile";

export const PAYPAL_REQUIRED_MESSAGE =
  "Vui lòng liên kết tài khoản PayPal ở mục Thanh toán / PayPal trước khi tạo dịch vụ.";

export function isPayPalLinked(profile: Pick<ProviderProfile, "paypalPayerId">) {
  return Boolean(profile.paypalPayerId);
}
