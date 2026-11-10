import { auth } from "@/lib/auth";
import { providerProfileRepo } from "@/entities/provider-profile";
import { hotelBookingRepo } from "@/entities/hotel-booking";
import {
  parseHotelBookingsQuery,
  toHotelBookingFilter,
} from "@/features/provider/hotel-bookings";
import {
  getBookingStatusMeta,
  getPaymentMeta,
  getPaymentState,
} from "@/features/provider/tour-bookings";
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
      "hotel",
    );
  if (!profile) return new Response("Forbidden", { status: 403 });

  const query = parseHotelBookingsQuery(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  const bookings = await hotelBookingRepo.findAllByProviderProfileId(
    profile.id,
    toHotelBookingFilter(query),
  );

  const money = "#,##0";
  const buffer = await buildXlsx(
    "Đơn đặt phòng",
    [
      { header: "Mã đơn", key: "code", width: 20 },
      { header: "Khách sạn", key: "hotel", width: 32 },
      { header: "Phòng", key: "room", width: 26 },
      { header: "Khách hàng", key: "customer", width: 24 },
      { header: "Email", key: "email", width: 28 },
      { header: "SĐT", key: "phone", width: 14 },
      { header: "Nhận phòng", key: "checkIn", width: 14 },
      { header: "Trả phòng", key: "checkOut", width: 14 },
      { header: "Số đêm", key: "nights", width: 9 },
      { header: "Số phòng", key: "rooms", width: 10 },
      { header: "Số khách", key: "guests", width: 10 },
      { header: "Tổng tiền (VND)", key: "total", numFmt: money },
      { header: "Phí nền tảng (VND)", key: "fee", numFmt: money },
      { header: "Thực nhận (VND)", key: "provider", numFmt: money },
      { header: "Thanh toán", key: "payment", width: 16 },
      { header: "Trạng thái", key: "status", width: 18 },
      { header: "Ngày đặt", key: "createdAt", width: 18 },
    ],
    bookings.map((b) => ({
      code: b.code,
      hotel: b.hotelName,
      room: b.roomName,
      customer: b.contactName,
      email: b.contactEmail,
      phone: b.contactPhone,
      checkIn: formatDateOnly(b.checkInDate),
      checkOut: formatDateOnly(b.checkOutDate),
      nights: b.nights,
      rooms: b.roomQuantity,
      guests: b.guests,
      total: Number(b.totalAmount),
      fee: Number(b.platformFee),
      provider: Number(b.providerAmount),
      payment: getPaymentMeta(getPaymentState(b)).label,
      status: getBookingStatusMeta(b.status).label,
      createdAt: formatDateTimeVN(b.createdAt),
    })),
  );
  return xlsxResponse(buffer, exportFilename("don-dat-phong"));
}
