import { auth } from "@/lib/auth";
import { providerProfileRepo } from "@/entities/provider-profile";
import { restaurantBookingRepo } from "@/entities/restaurant-booking";
import {
  formatTimeRange,
  parseRestaurantBookingsQuery,
  toRestaurantBookingFilter,
} from "@/features/provider/restaurant-bookings";
import { getBookingStatusMeta } from "@/features/provider/tour-bookings";
import {
  buildXlsx,
  exportFilename,
  formatDateOnly,
  formatDateTimeVN,
  xlsxResponse,
} from "@/lib/export-xlsx";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const profile =
    await providerProfileRepo.findApprovedByUserIdAndBusinessType(
      session.user.id,
      "restaurant",
    );
  if (!profile) return new Response("Forbidden", { status: 403 });

  const query = parseRestaurantBookingsQuery(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  const bookings = await restaurantBookingRepo.findAllByProviderProfileId(
    profile.id,
    toRestaurantBookingFilter(query),
  );

  const buffer = await buildXlsx(
    "Đơn đặt bàn",
    [
      { header: "Mã đơn", key: "code", width: 20 },
      { header: "Nhà hàng", key: "restaurant", width: 32 },
      { header: "Khách hàng", key: "customer", width: 24 },
      { header: "Email", key: "email", width: 28 },
      { header: "SĐT", key: "phone", width: 14 },
      { header: "Ngày đặt bàn", key: "date", width: 14 },
      { header: "Khung giờ", key: "time", width: 14 },
      { header: "Số khách", key: "guests", width: 10 },
      { header: "Trạng thái", key: "status", width: 18 },
      { header: "Ghi chú", key: "note", width: 36 },
      { header: "Ngày tạo", key: "createdAt", width: 18 },
    ],
    bookings.map((b) => ({
      code: b.code,
      restaurant: b.restaurantName,
      customer: b.contactName,
      email: b.contactEmail,
      phone: b.contactPhone,
      date: formatDateOnly(b.reservationDate),
      time: formatTimeRange(
        b.startTime,
        b.restaurantTimeSlot?.endTime ?? null,
      ),
      guests: b.guests,
      status: getBookingStatusMeta(b.status).label,
      note: b.note,
      createdAt: formatDateTimeVN(b.createdAt),
    })),
  );
  return xlsxResponse(buffer, exportFilename("don-dat-ban"));
}
