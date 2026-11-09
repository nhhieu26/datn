// Next.js gọi register() một lần khi khởi động server
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // Import động để code Node (OpenTelemetry SDK) không bị bundle vào runtime khác
  const { initTelemetry } = await import("./lib/telemetry");
  initTelemetry();
}
