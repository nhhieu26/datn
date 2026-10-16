import { createHmac, timingSafeEqual } from "node:crypto";
import type { PayPalIdentity } from "@/lib/paypal";

// Giữ tài khoản PayPal vừa liên kết cho đến khi hồ sơ được tạo (lúc OAuth chưa có profileId)
export const PENDING_COOKIE = "paypal_pending";
export const PENDING_MAX_AGE = 30 * 60;

export type PendingLink = PayPalIdentity & { linkedAt: string };

type Payload = PendingLink & { userId: string };

function sign(data: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET!)
    .update(data)
    .digest("base64url");
}

export function signPendingLink(userId: string, identity: PayPalIdentity): string {
  const payload: Payload = {
    userId,
    email: identity.email,
    payerId: identity.payerId,
    linkedAt: new Date().toISOString(),
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function readPendingLink(
  value: string | undefined,
  userId: string
): PendingLink | null {
  const [data, signature] = (value ?? "").split(".");
  if (!data || !signature) return null;

  const expected = Buffer.from(sign(data));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString()
    ) as Payload;
    const age = Date.now() - new Date(payload.linkedAt).getTime();
    if (payload.userId !== userId || !(age < PENDING_MAX_AGE * 1000)) return null;
    return {
      email: payload.email,
      payerId: payload.payerId,
      linkedAt: payload.linkedAt,
    };
  } catch {
    return null;
  }
}
