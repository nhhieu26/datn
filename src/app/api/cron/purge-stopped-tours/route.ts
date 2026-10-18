import { tourRepo } from "@/entities/tour";
import { tourBookingRepo } from "@/entities/tour-booking";

// Vercel Cron gọi hằng ngày (xem vercel.json), kèm header Authorization: Bearer CRON_SECRET.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Đơn giữ chỗ quá hạn chưa thanh toán không được chặn việc xóa tour
  await tourBookingRepo.releaseExpired();
  const deleted = await tourRepo.softDeleteExpired(new Date());
  return Response.json({ deleted });
}
