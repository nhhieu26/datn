import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { ForbiddenError, UnauthenticatedError } from "@/shared/lib/errors";

export async function requireAdmin(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthenticatedError("Vui lòng đăng nhập với tài khoản quản trị.");
  }
  if (session.user.role !== "admin") {
    throw new ForbiddenError(
      "Chỉ tài khoản quản trị mới có thể thực hiện thao tác này."
    );
  }
  return session;
}
