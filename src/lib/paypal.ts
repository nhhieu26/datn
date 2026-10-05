const isLive = process.env.PAYPAL_MODE === "live";
const CONNECT_URL = isLive
  ? "https://www.paypal.com/connect"
  : "https://www.sandbox.paypal.com/connect";
const API_URL = isLive
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

// openid + email + (xác minh tài khoản & payer ID) — bộ thông tin PayPal yêu cầu cho payout
const SCOPE =
  "openid email https://uri.paypal.com/services/paypalattributes";

export type PayPalIdentity = { email: string; payerId: string };

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.PAYPAL_CLIENT_ID!,
    response_type: "code",
    scope: SCOPE,
    redirect_uri: process.env.PAYPAL_REDIRECT_URI!,
    state,
  });
  return `${CONNECT_URL}?${params}`;
}

async function exchangeCode(code: string): Promise<string> {
  const basic = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch(`${API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code }),
  });
  if (!res.ok) throw new Error(`PayPal token request failed (${res.status})`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("PayPal token response missing access_token");
  return json.access_token;
}

/**
 * Đổi authorization code lấy email + payer ID của tài khoản PayPal.
 * Trả null nếu PayPal không trả đủ thông tin hoặc tài khoản chưa xác minh.
 */
export async function fetchPayPalIdentity(
  code: string
): Promise<PayPalIdentity | null> {
  const token = await exchangeCode(code);
  const res = await fetch(`${API_URL}/v1/identity/oauth2/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`PayPal userinfo request failed (${res.status})`);
  const info = (await res.json()) as Record<string, unknown>;

  // ponytail: tên claim chưa xác nhận từ docs — kiểm tra bằng response sandbox thật rồi chốt lại
  if (process.env.NODE_ENV !== "production") {
    console.info("[paypal] userinfo claims:", Object.keys(info));
  }

  const payerId = typeof info.payer_id === "string" ? info.payer_id : null;
  const emails = Array.isArray(info.emails)
    ? (info.emails as { value?: string; primary?: boolean }[])
    : [];
  const email =
    typeof info.email === "string"
      ? info.email
      : (emails.find((e) => e.primary) ?? emails[0])?.value;
  const unverified =
    info.verified_account === false ||
    info.verified_account === "false" ||
    info.email_verified === false;

  if (!payerId || !email || unverified) return null;
  return { email, payerId };
}
