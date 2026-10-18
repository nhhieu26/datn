import { restaurantRepo } from "@/entities/restaurant";

// Vercel Cron gọi hằng ngày (xem vercel.json), kèm header Authorization: Bearer CRON_SECRET.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const deleted = await restaurantRepo.softDeleteExpired(new Date());
  return Response.json({ deleted });
}
