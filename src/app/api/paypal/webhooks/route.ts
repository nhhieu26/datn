import type { Prisma } from "@/generated/prisma/client";
import { tourBookingRepo } from "@/entities/tour-booking";
import {
  mapPayoutItemStatus,
  mapRefundStatus,
  verifyWebhookSignature,
} from "@/lib/paypal";

type WebhookEvent = {
  id?: string;
  event_type?: string;
  resource?: Record<string, unknown>;
};

const str = (value: unknown) => (typeof value === "string" ? value : null);

// Đăng ký URL này trong PayPal Developer Dashboard (app → Webhooks), chọn các event
// PAYMENT.PAYOUTS-ITEM.*, PAYMENT.PAYOUTSBATCH.DENIED, PAYMENT.CAPTURE.REFUNDED,
// PAYMENT.REFUND.PENDING, PAYMENT.REFUND.FAILED; đặt Webhook ID vào PAYPAL_WEBHOOK_ID.
export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!(await verifyWebhookSignature(request.headers, rawBody))) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody) as WebhookEvent;
  const type = event.event_type ?? "";
  const resource = event.resource ?? {};
  const raw = event as Prisma.InputJsonValue;

  // Lỗi DB → trả 500 để PayPal gửi lại; các update đều idempotent.
  if (type.startsWith("PAYMENT.PAYOUTS-ITEM.")) {
    const item = (resource.payout_item ?? {}) as Record<string, unknown>;
    const errors = (resource.errors ?? {}) as Record<string, unknown>;
    const status = mapPayoutItemStatus(resource.transaction_status);
    await tourBookingRepo.applyPayoutItemWebhook(
      {
        payoutId: str(item.sender_item_id),
        batchId: str(resource.payout_batch_id),
        itemId: str(resource.payout_item_id),
      },
      {
        status,
        failureReason:
          status === "failed"
            ? (str(errors.message) ??
              `Payout item ${String(resource.transaction_status)}`)
            : null,
        raw,
      },
    );
  } else if (type === "PAYMENT.PAYOUTSBATCH.DENIED") {
    const header = (resource.batch_header ?? {}) as Record<string, unknown>;
    const batchId = str(header.payout_batch_id);
    if (batchId) await tourBookingRepo.applyPayoutBatchDenied(batchId, raw);
  } else if (
    type === "PAYMENT.CAPTURE.REFUNDED" ||
    type === "PAYMENT.REFUND.PENDING" ||
    type === "PAYMENT.REFUND.FAILED"
  ) {
    const status = mapRefundStatus(resource.status);
    await tourBookingRepo.applyRefundWebhook(
      { refundId: str(resource.custom_id), gatewayRefundId: str(resource.id) },
      {
        status,
        failureReason:
          status === "failed" ? `Refund ${String(resource.status)}` : null,
        raw,
      },
    );
  }

  return new Response(null, { status: 200 });
}
