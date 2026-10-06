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

async function requestToken(body: Record<string, string>): Promise<string> {
  const basic = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch(`${API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });
  if (!res.ok) throw new Error(`PayPal token request failed (${res.status})`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("PayPal token response missing access_token");
  return json.access_token;
}

function exchangeCode(code: string): Promise<string> {
  return requestToken({ grant_type: "authorization_code", code });
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

// --- Orders v2: customer thanh toán cho platform ---

type PayPalLink = { href: string; rel: string };

async function ordersRequest(
  path: string,
  init: { body?: unknown; requestId?: string } = {}
): Promise<{ ok: boolean; status: number; json: Record<string, unknown> }> {
  const token = await requestToken({ grant_type: "client_credentials" });
  const res = await fetch(`${API_URL}/v2/checkout/orders${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.requestId && { "PayPal-Request-Id": init.requestId }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, status: res.status, json };
}

export async function createOrder(input: {
  amountUsd: string;
  referenceId: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; approveUrl: string }> {
  const { ok, status, json } = await ordersRequest("", {
    requestId: `create-${input.referenceId}-${Date.now()}`,
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: input.referenceId,
          description: input.description.slice(0, 127),
          amount: { currency_code: "USD", value: input.amountUsd },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Roamly",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl,
          },
        },
      },
    },
  });
  if (!ok) throw new Error(`PayPal create order failed (${status})`);
  const links = (json.links ?? []) as PayPalLink[];
  const approveUrl = links.find(
    (l) => l.rel === "payer-action" || l.rel === "approve"
  )?.href;
  if (typeof json.id !== "string" || !approveUrl) {
    throw new Error("PayPal create order response missing id/approve link");
  }
  return { id: json.id, approveUrl };
}

export type CaptureResult = {
  completed: boolean;
  captureId: string | null;
  raw: Record<string, unknown>;
};

/** Capture order đã được customer approve. PayPal-Request-Id giúp gọi lại an toàn. */
export async function captureOrder(orderId: string): Promise<CaptureResult> {
  const { ok, status, json } = await ordersRequest(`/${orderId}/capture`, {
    requestId: `capture-${orderId}`,
  });
  // 5xx/429: chưa rõ kết quả → để caller thử lại, không coi là bị từ chối
  if (status >= 500 || status === 429) {
    throw new Error(`PayPal capture order failed (${status})`);
  }
  const units = (json.purchase_units ?? []) as {
    payments?: { captures?: { id: string; status: string }[] };
  }[];
  const capture = units[0]?.payments?.captures?.[0];
  return {
    completed: ok && json.status === "COMPLETED" && capture?.status === "COMPLETED",
    captureId: capture?.id ?? null,
    raw: json,
  };
}
