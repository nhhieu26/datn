import { providerProfileRepo } from "@/entities/provider-profile";
import { auth } from "@/lib/auth";
import { fetchPayPalIdentity } from "@/lib/paypal";
import {
  PENDING_COOKIE,
  PENDING_MAX_AGE,
  signPendingLink,
} from "@/lib/paypal-pending";
import { NextResponse, type NextRequest } from "next/server";

const STATE_COOKIE = "paypal_link_state";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "provider") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  const userId = session.user.id;

  const [savedState, profileId] = (
    request.cookies.get(STATE_COOKIE)?.value ?? ""
  ).split(".");

  const done = (status: string) => {
    const page = profileId
      ? `/provider/profiles/${profileId}/edit`
      : "/provider/profiles/create";
    const res = NextResponse.redirect(
      new URL(`${page}?paypal=${status}`, request.url)
    );
    res.cookies.delete({ name: STATE_COOKIE, path: "/api/paypal" });
    return res;
  };

  const params = request.nextUrl.searchParams;
  if (params.get("error")) return done("cancelled");

  const code = params.get("code");
  if (!code || !savedState || params.get("state") !== savedState) {
    return done("error");
  }

  try {
    const identity = await fetchPayPalIdentity(code);
    if (!identity) return done("unverified");

    if (profileId) {
      const { count } = await providerProfileRepo.linkPayPal(
        profileId,
        userId,
        identity
      );
      return done(count ? "linked" : "error");
    }

    const res = done("linked");
    res.cookies.set(PENDING_COOKIE, signPendingLink(userId, identity), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: PENDING_MAX_AGE,
    });
    return res;
  } catch (error) {
    console.error("PayPal link failed", error);
    return done("error");
  }
}
