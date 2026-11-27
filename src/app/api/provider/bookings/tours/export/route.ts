import { auth } from "@/lib/auth";
import { providerProfileRepo } from "@/entities/provider-profile";
import { tourBookingRepo } from "@/entities/tour-booking";
import {
  getBookingStatusMeta,
  getPaymentMeta,
  getPaymentState,
  parseTourBookingsQuery,
  toTourBookingFilter,
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
      "tour",
    );
  if (!profile) return new Response("Forbidden", { status: 403 });

  const query = parseTourBookingsQuery(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  const bookings = await tourBookingRepo.findAllByProviderProfileId(
    profile.id,
    toTourBookingFilter(query),
  );

  const money = "#,##0";
  const buffer = await buildXlsx(
    "Đơn đặt tour",
    [
      { header: "Mã đơn", key: "code", width: 20 },
      { header: "Tour", key: "tour", width: 40 },
      { header: "Khách hàng", key: "customer", width: 24 },
      { header: "Email", key: "email", width: 28 },
      { header: "SĐT", key: "phone", width: 14 },
      { header: "Ngày khởi hành", key: "departure", width: 16 },
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
      tour: b.tourTitle,
      customer: b.contactName,
      email: b.contactEmail,
      phone: b.contactPhone,
      departure: formatDateOnly(b.departureDate),
      guests: b.guests,
      total: Number(b.totalAmount),
      fee: Number(b.platformFee),
      provider: Number(b.providerAmount),
      payment: getPaymentMeta(getPaymentState(b)).label,
      status: getBookingStatusMeta(b.status).label,
      createdAt: formatDateTimeVN(b.createdAt),
    })),
  );
  return xlsxResponse(buffer, exportFilename("don-dat-tour"));
}
