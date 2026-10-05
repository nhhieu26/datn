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

  const profileId = request.nextUrl.searchParams.get("profileId") ?? "";
  const profile = profileId
    ? await providerProfileRepo.findById(profileId, session.user.id)
    : null;
  if (!profile) {
    return NextResponse.redirect(
      new URL("/provider/payments?status=error", request.url)
    );
  }

  const state = randomBytes(24).toString("hex");
  const response = NextResponse.redirect(buildAuthorizeUrl(state));
  response.cookies.set(STATE_COOKIE, `${state}.${profile.id}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/paypal",
    maxAge: 600,
  });
  return response;
}
