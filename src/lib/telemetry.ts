// Giám sát AI (thời gian, tham số/kết quả tool, token) bằng OpenTelemetry → Langfuse.
// Khởi tạo một lần trong src/instrumentation.ts; thiếu LANGFUSE_* key thì mọi hàm ở đây không làm gì.
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { propagateAttributes } from "@langfuse/tracing";
import { LangfuseVercelAiSdkIntegration } from "@langfuse/vercel-ai-sdk";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { registerTelemetry } from "ai";

// Bundle của instrumentation và của route có thể là hai bản module khác nhau → giữ processor trên globalThis
const store = globalThis as typeof globalThis & { __langfuseProcessor?: LangfuseSpanProcessor };

export const telemetryEnabled = () => Boolean(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY);

export function initTelemetry() {
  if (store.__langfuseProcessor || !telemetryEnabled()) return;

  const processor = new LangfuseSpanProcessor();
  new NodeTracerProvider({ spanProcessors: [processor] }).register();
  registerTelemetry(new LangfuseVercelAiSdkIntegration());
  store.__langfuseProcessor = processor;
}

/** Đẩy các span còn trong hàng đợi lên Langfuse (gọi trong `after()` để function serverless không tắt trước). */
export async function flushTelemetry() {
  await store.__langfuseProcessor?.forceFlush().catch((error) => console.error("flushTelemetry:", error));
}

export type TraceAttributes = {
  name: string;
  sessionId?: string;
  userId?: string;
  tags?: string[];
  metadata?: Record<string, string>;
};

/** Gắn tên trace, session, user, tag cho mọi lần gọi AI SDK bên trong `fn`. */
export function withTrace<T>(attrs: TraceAttributes, fn: () => T): T {
  if (!store.__langfuseProcessor) return fn();
  return propagateAttributes(
    {
      traceName: attrs.name,
      // Langfuse giới hạn 200 ký tự cho các giá trị này
      sessionId: attrs.sessionId?.slice(0, 200),
      userId: attrs.userId?.slice(0, 200),
      tags: attrs.tags,
      metadata: attrs.metadata,
      environment: process.env.VERCEL_ENV ?? "development",
    },
    fn,
  );
}
