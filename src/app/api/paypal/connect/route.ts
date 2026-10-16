import { providerProfileRepo } from "@/entities/provider-profile";
import { auth } from "@/lib/auth";
import { buildAuthorizeUrl } from "@/lib/paypal";
import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

const STATE_COOKIE = "paypal_link_state";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "provider") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Có profileId → đổi PayPal cho hồ sơ đang sửa; không có → liên kết trước khi tạo hồ sơ
  const profileId = request.nextUrl.searchParams.get("profileId") ?? "";
  if (profileId) {
    const profile = await providerProfileRepo.findById(profileId, session.user.id);
    if (!profile) {
      return NextResponse.redirect(new URL("/provider/profiles", request.url));
    }
  }

  const state = randomBytes(24).toString("hex");
  const response = NextResponse.redirect(buildAuthorizeUrl(state));
  response.cookies.set(STATE_COOKIE, `${state}.${profileId}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/paypal",
    maxAge: 600,
  });
  return response;
}
