/**
 * Dời ngày của đơn tour / khách sạn / nhà hàng về quá khứ để test luồng "đã xảy ra"
 * (provider hoàn thành đơn, customer đánh giá...).
 *
 *   bun scripts/mark-bookings-happened.ts TB-1234ABCD
 *   bun scripts/mark-bookings-happened.ts TB-1234ABCD HB-5678EFGH,RB-90AB12CD
 *   bun scripts/mark-bookings-happened.ts RB-90AB12CD --complete
 *
 * Mặc định chỉ dời ngày, giữ nguyên trạng thái để provider tự bấm "Hoàn thành".
 * --complete: chuyển luôn sang completed. Đơn tour/khách sạn khi đó KHÔNG tạo Payout
 * như luồng provider thật.
 */
import "dotenv/config";
import type { BookingStatus } from "../src/generated/prisma/enums";
import { prisma } from "../src/lib/prisma";
import { todayIsoDate } from "../src/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Ngày hôm nay (giờ VN) lùi `n` ngày, dạng 00:00 UTC giống cách lưu ngày của đơn. */
function daysAgo(n: number) {
  return new Date(new Date(`${todayIsoDate()}T00:00:00Z`).getTime() - n * DAY_MS);
}

function shift(date: Date, deltaMs: number) {
  return new Date(date.getTime() + deltaMs);
}

function iso(date: Date) {
  return date.toISOString().slice(0, 10);
}

const COMPLETABLE: BookingStatus[] = ["paid", "confirmed", "completed"];

/** Đơn đã completed thì giữ nguyên completedAt. */
function completeData(status: BookingStatus, confirmedAt: Date | null) {
  if (status === "completed") return {};
  return {
    status: "completed" as const,
    completedAt: new Date(),
    ...(confirmedAt ? {} : { confirmedAt: new Date() }),
  };
}

/**
 * Tour: lịch khởi hành dùng chung cho nhiều đơn nên dời cả departure và mọi đơn
 * của departure đó, giữ nguyên độ dài tour; ngày kết thúc thành 2 ngày trước.
 */
async function markTour(code: string, complete: boolean) {
  const booking = await prisma.tourBooking.findUnique({
    where: { code },
    include: {
      tourDeparture: { include: { tour: { select: { durationDays: true } } } },
    },
  });
  if (!booking) return false;

  const departure = booking.tourDeparture;
  const start = departure?.departureDate ?? booking.departureDate;
  const end =
    departure?.returnDate ??
    shift(start, Math.max((departure?.tour.durationDays ?? 1) - 1, 0) * DAY_MS);
  const delta = daysAgo(2).getTime() - end.getTime();

  await prisma.$transaction(async (tx) => {
    if (delta < 0) {
      if (departure) {
        await tx.tourDeparture.update({
          where: { id: departure.id },
          data: {
            departureDate: shift(departure.departureDate, delta),
            returnDate: departure.returnDate && shift(departure.returnDate, delta),
          },
        });
        const siblings = await tx.tourBooking.findMany({
          where: { tourDepartureId: departure.id },
          select: { id: true, code: true, departureDate: true },
        });
        for (const s of siblings) {
          await tx.tourBooking.update({
            where: { id: s.id },
            data: { departureDate: shift(s.departureDate, delta) },
          });
        }
        const others = siblings.filter((s) => s.code !== code).map((s) => s.code);
        if (others.length) {
          console.log(`  ↳ dời cùng lịch khởi hành: ${others.join(", ")}`);
        }
      } else {
        await tx.tourBooking.update({
          where: { id: booking.id },
          data: { departureDate: shift(booking.departureDate, delta) },
        });
      }
    }
    if (complete) {
      await tx.tourBooking.update({
        where: { id: booking.id },
        data: completeData(booking.status, booking.confirmedAt),
      });
    }
  });

  report("tour", code, booking.status, complete, delta < 0
    ? `${iso(shift(start, delta))} → ${iso(shift(end, delta))}`
    : null);
  return true;
}

/** Khách sạn: giữ số đêm, trả phòng từ hôm qua. */
async function markHotel(code: string, complete: boolean) {
  const booking = await prisma.hotelBooking.findUnique({ where: { code } });
  if (!booking) return false;

  const checkOut = daysAgo(1);
  const moved = booking.checkOutDate.getTime() > checkOut.getTime();
  const checkIn = shift(checkOut, -booking.nights * DAY_MS);

  await prisma.hotelBooking.update({
    where: { id: booking.id },
    data: {
      ...(moved && { checkInDate: checkIn, checkOutDate: checkOut }),
      ...(complete && completeData(booking.status, booking.confirmedAt)),
    },
  });

  report("hotel", code, booking.status, complete, moved
    ? `${iso(checkIn)} → ${iso(checkOut)}`
    : null);
  return true;
}

/** Nhà hàng: giữ khung giờ, ngày đặt bàn là hôm qua. */
async function markRestaurant(code: string, complete: boolean) {
  const booking = await prisma.restaurantBooking.findUnique({ where: { code } });
  if (!booking) return false;

  const date = daysAgo(1);
  const moved = booking.reservationDate.getTime() > date.getTime();

  await prisma.restaurantBooking.update({
    where: { id: booking.id },
    data: {
      ...(moved && { reservationDate: date }),
      ...(complete && completeData(booking.status, booking.confirmedAt)),
    },
  });

  report("restaurant", code, booking.status, complete, moved
    ? `${iso(date)} ${booking.startTime}`
    : null);
  return true;
}

function report(
  kind: string,
  code: string,
  status: BookingStatus,
  complete: boolean,
  movedTo: string | null,
) {
  const dates = movedTo ? `ngày mới ${movedTo}` : "đã ở quá khứ, giữ nguyên ngày";
  const next = complete ? "completed" : status;
  console.log(`✓ [${kind}] ${code}: ${dates}, trạng thái ${next}`);
  // Restaurant hoàn thành từ confirmed; tour/hotel từ confirmed (paid cần provider xác nhận trước)
  if (!complete && !COMPLETABLE.includes(status) && status !== "pending_confirmation") {
    console.log(`  ⚠ trạng thái ${status} không hoàn thành được qua luồng provider`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const complete = args.includes("--complete");
  const codes = [
    ...new Set(
      args
        .filter((a) => !a.startsWith("--"))
        .flatMap((a) => a.split(","))
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean),
    ),
  ];

  if (codes.length === 0) {
    console.error(
      "Cách dùng: bun scripts/mark-bookings-happened.ts <mã đơn> [mã đơn...] [--complete]",
    );
    process.exit(1);
  }

  const missing: string[] = [];
  for (const code of codes) {
    const found =
      (await markTour(code, complete)) ||
      (await markHotel(code, complete)) ||
      (await markRestaurant(code, complete));
    if (!found) missing.push(code);
  }

  if (missing.length) {
    console.error(`✗ Không tìm thấy đơn: ${missing.join(", ")}`);
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
