import { hotelRepo } from "@/entities/hotel";
import { hotelBookingRepo } from "@/entities/hotel-booking";

// Vercel Cron gọi hằng ngày (xem vercel.json), kèm header Authorization: Bearer CRON_SECRET.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Đơn giữ phòng quá hạn chưa thanh toán không được chặn việc xóa khách sạn
  await hotelBookingRepo.releaseExpired();
  const deleted = await hotelRepo.softDeleteExpired(new Date());
  return Response.json({ deleted });
}
