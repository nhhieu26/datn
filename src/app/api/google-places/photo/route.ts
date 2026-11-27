import { auth } from "@/lib/auth";

// Proxy ảnh Google Places cho tính năng tự điền form (ảnh Google không chắc có CORS).
// Chỉ provider/admin dùng, chỉ cho phép host ảnh của Google để tránh SSRF.
const ALLOWED_HOSTS = [/^places\.googleapis\.com$/, /^lh\d+\.googleusercontent\.com$/];
const MAX_BYTES = 10 * 1024 * 1024;
const TIMEOUT_MS = 15000;

const isAllowed = (url: URL) =>
  url.protocol === "https:" && ALLOWED_HOSTS.some((re) => re.test(url.hostname));

export async function GET(request: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "provider" && role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = new URL(request.url).searchParams.get("url");
  let target: URL;
  try {
    target = new URL(raw ?? "");
  } catch {
    return Response.json({ error: "URL không hợp lệ" }, { status: 400 });
  }
  if (!isAllowed(target)) {
    return Response.json({ error: "Host không được phép" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      // Browser key thường bị giới hạn theo HTTP referrer → gửi origin của app
      // Form chỉ nhận PNG/JPEG → không xin WebP/AVIF
      headers: {
        Referer: `${new URL(request.url).origin}/`,
        Accept: "image/jpeg,image/png;q=0.9",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    return Response.json({ error: "Không tải được ảnh" }, { status: 502 });
  }

  // Sau redirect vẫn phải là host của Google
  if (!isAllowed(new URL(upstream.url))) {
    return Response.json({ error: "Host không được phép" }, { status: 400 });
  }
  const contentType = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || !contentType.startsWith("image/")) {
    return Response.json({ error: "Không tải được ảnh" }, { status: 502 });
  }
  if (Number(upstream.headers.get("content-length") ?? 0) > MAX_BYTES) {
    return Response.json({ error: "Ảnh quá lớn" }, { status: 413 });
  }

  const body = await upstream.arrayBuffer();
  if (body.byteLength > MAX_BYTES) {
    return Response.json({ error: "Ảnh quá lớn" }, { status: 413 });
  }
  return new Response(body, {
    headers: { "Content-Type": contentType, "Cache-Control": "private, no-store" },
  });
}
