import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ADMIN_SIGN_IN_PATH = "/admin/sign-in";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname === ADMIN_SIGN_IN_PATH) {
    return NextResponse.next();
  }

  const session = req.auth;
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.redirect(new URL(ADMIN_SIGN_IN_PATH, req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
