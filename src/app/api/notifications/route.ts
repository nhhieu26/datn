import { type NextRequest } from "next/server";
import { notificationRepo, type NotificationFilter } from "@/entities/notification";
import { auth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/shared/lib/api-response";
import { UnauthenticatedError } from "@/shared/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthenticatedError();
    }

    const filterParam = request.nextUrl.searchParams.get("filter");
    const filter: NotificationFilter =
      filterParam === "unread" ? "unread" : "all";

    const takeParam = Number(request.nextUrl.searchParams.get("take") ?? 20);
    const take = Number.isFinite(takeParam) ? takeParam : 20;

    const data = await notificationRepo.findRecentByUserId(session.user.id, {
      filter,
      take,
    });

    return apiSuccess(data);
  } catch (error) {
    return apiError(error);
  }
}
