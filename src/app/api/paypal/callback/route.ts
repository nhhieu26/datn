import { providerProfileRepo } from "@/entities/provider-profile";
import { auth } from "@/lib/auth";
import { fetchPayPalIdentity } from "@/lib/paypal";
import { NextResponse, type NextRequest } from "next/server";

const STATE_COOKIE = "paypal_link_state";

export async function GET(request: NextRequest) {
  const done = (status: string) => {
    const res = NextResponse.redirect(
      new URL(`/provider/payments?status=${status}`, request.url)
    );
    res.cookies.delete({ name: STATE_COOKIE, path: "/api/paypal" });
    return res;
  };

  const session = await auth();
  if (!session?.user || session.user.role !== "provider") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const params = request.nextUrl.searchParams;
  if (params.get("error")) return done("cancelled");

  const [savedState, profileId] = (
    request.cookies.get(STATE_COOKIE)?.value ?? ""
  ).split(".");
  const code = params.get("code");
  if (!code || !profileId || !savedState || params.get("state") !== savedState) {
    return done("error");
  }

  try {
    const identity = await fetchPayPalIdentity(code);
    if (!identity) return done("unverified");
    const { count } = await providerProfileRepo.linkPayPal(
      profileId,
      session.user.id,
      identity
    );
    return done(count ? "linked" : "error");
  } catch (error) {
    console.error("PayPal link failed", error);
    return done("error");
  }
}
