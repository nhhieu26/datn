// Log thời gian chạy từng bước (đo độ trễ luồng AI). Bật mặc định khi dev; production đặt TIMING_LOG=1.
const enabled = () => process.env.NODE_ENV !== "production" || process.env.TIMING_LOG === "1";

export function logTiming(label: string, ms: number, detail?: string) {
  if (!enabled()) return;
  console.log(`[timing] ${label}: ${Math.round(ms)}ms${detail ? ` (${detail})` : ""}`);
}

/** Chạy `fn` và log thời gian, kể cả khi lỗi. */
export async function timed<T>(label: string, fn: () => Promise<T>, detail?: (result: T) => string): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    logTiming(label, performance.now() - start, detail?.(result));
    return result;
  } catch (error) {
    logTiming(label, performance.now() - start, "lỗi");
    throw error;
  }
}
