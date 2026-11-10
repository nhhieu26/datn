/**
 * Seed đơn đặt tour / khách sạn / nhà hàng để test lịch và trang quản lý đơn của provider.
 * Chạy sau seed user + dịch vụ (đã gọi trong scripts/seed.ts), hoặc chạy riêng:
 *
 *   bun scripts/seed-booking.ts
 *
 * Đơn seed được đánh dấu bằng ghi chú SEED_NOTE; chạy lại sẽ xóa đơn seed cũ rồi tạo mới.
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { Prisma, type BookingStatus } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";
import { formatEntityCode, todayIsoDate } from "../src/lib/utils";

const SEED_NOTE = "[seed] Đơn mẫu";
const COMMISSION_RATE = Number(process.env.PLATFORM_COMMISSION_RATE ?? 0.1);
const DAY_MS = 24 * 60 * 60 * 1000;
const USD_RATE = 25_000;

/** Đơn còn giữ chỗ (trừ slot departure). */
const HOLDING: BookingStatus[] = ["paid", "confirmed", "completed"];

/** Hôm nay (giờ VN) dịch `n` ngày, dạng 00:00 UTC giống cách lưu ngày của đơn. */
function dayOffset(n: number) {
  return new Date(new Date(`${todayIsoDate()}T00:00:00Z`).getTime() + n * DAY_MS);
}

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

function money(totalAmount: Prisma.Decimal) {
  const platformFee = totalAmount.mul(COMMISSION_RATE).toDecimalPlaces(2);
  return {
    totalAmount,
    commissionRate: COMMISSION_RATE,
    platformFee,
    providerAmount: totalAmount.sub(platformFee),
  };
}

/** Mốc thời gian theo trạng thái để đơn trông giống đơn thật. */
function statusDates(status: BookingStatus) {
  const now = new Date();
  return {
    confirmedAt: ["confirmed", "completed"].includes(status) ? now : null,
    completedAt: status === "completed" ? now : null,
    cancelledAt: status === "cancelled" ? now : null,
    cancelReason: status === "cancelled" ? "Khách thay đổi kế hoạch" : null,
  };
}

function paymentFor(code: string, amount: Prisma.Decimal) {
  return {
    gateway: "paypal" as const,
    status: "succeeded" as const,
    amount,
    chargedAmount: amount.div(USD_RATE).toDecimalPlaces(2),
    chargedCurrency: "USD",
    exchangeRate: new Prisma.Decimal(USD_RATE),
    gatewayOrderId: `SEED-${code}`,
    paidAt: new Date(),
  };
}

type Customer = { id: string; fullname: string; phone: string; email: string };

function contact(customer: Customer) {
  return {
    customerId: customer.id,
    contactName: customer.fullname,
    contactPhone: customer.phone,
    contactEmail: customer.email,
    note: SEED_NOTE,
  };
}

/** Xóa đơn seed cũ (kèm payment) và trả lại slot đã giữ. */
async function clearSeedBookings() {
  const tours = await prisma.tourBooking.findMany({
    where: { note: SEED_NOTE },
    select: { id: true, guests: true, status: true, tourDepartureId: true },
  });
  const hotels = await prisma.hotelBooking.findMany({
    where: { note: SEED_NOTE },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.payment.deleteMany({
      where: {
        OR: [
          { tourBookingId: { in: tours.map((b) => b.id) } },
          { hotelBookingId: { in: hotels.map((b) => b.id) } },
        ],
      },
    }),
    // Trả slot đã giữ của đơn seed cũ
    ...tours
      .filter((b) => b.tourDepartureId && HOLDING.includes(b.status))
      .map((b) =>
        prisma.tourDeparture.update({
          where: { id: b.tourDepartureId! },
          data: { bookedSlots: { decrement: b.guests } },
        }),
      ),
    prisma.tourBooking.deleteMany({ where: { note: SEED_NOTE } }),
    prisma.hotelBooking.deleteMany({ where: { note: SEED_NOTE } }),
    prisma.restaurantBooking.deleteMany({ where: { note: SEED_NOTE } }),
  ]);
}

async function seedTourBookings(customers: Customer[]) {
  const tours = await prisma.tour.findMany({
    where: {
      deletedAt: null,
      providerProfile: { businessType: "tour", approvalStatus: "approved" },
    },
    include: {
      departures: {
        where: { status: "scheduled", departureDate: { gt: new Date() } },
        orderBy: { departureDate: "asc" },
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const statuses: BookingStatus[] = ["confirmed", "paid", "confirmed", "cancelled"];
  let count = 0;

  for (const [tourIndex, tour] of tours.entries()) {
    // Tour đầu danh sách không có đơn, để kiểm tra lịch trống khi lọc
    if (tourIndex === 0) continue;

    for (const [depIndex, departure] of tour.departures.entries()) {
      const status = pick(statuses, tourIndex + depIndex);
      const guests = 1 + ((tourIndex + depIndex) % 4);
      if (
        HOLDING.includes(status) &&
        departure.bookedSlots + guests > departure.totalSlots
      ) {
        continue;
      }

      const unitPrice = departure.price ?? tour.basePrice;
      const amounts = money(unitPrice.mul(guests));
      const code = formatEntityCode("TB", randomUUID());

      await prisma.$transaction(async (tx) => {
        await tx.tourBooking.create({
          data: {
            code,
            ...contact(pick(customers, count)),
            providerProfileId: tour.providerProfileId,
            tourDepartureId: departure.id,
            tourTitle: tour.title,
            departureDate: departure.departureDate,
            guests,
            status,
            unitPrice,
            ...amounts,
            ...statusDates(status),
            ...(status === "cancelled"
              ? {}
              : { payments: { create: paymentFor(code, amounts.totalAmount) } }),
          },
        });
        if (HOLDING.includes(status)) {
          await tx.tourDeparture.update({
            where: { id: departure.id },
            data: { bookedSlots: { increment: guests } },
          });
        }
      });
      count += 1;
    }
  }

  return count;
}

async function seedHotelBookings(customers: Customer[]) {
  const hotels = await prisma.hotel.findMany({
    where: {
      deletedAt: null,
      providerProfile: { businessType: "hotel", approvalStatus: "approved" },
    },
    include: { rooms: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  // [lệch ngày nhận phòng so với hôm nay, số đêm, trạng thái]
  const plans: [number, number, BookingStatus][] = [
    [-12, 2, "completed"],
    [-1, 3, "confirmed"],
    [3, 2, "paid"],
    [9, 1, "confirmed"],
    [18, 4, "cancelled"],
    [27, 2, "confirmed"],
  ];
  let count = 0;

  for (const [hotelIndex, hotel] of hotels.entries()) {
    if (hotelIndex === 0 || hotel.rooms.length === 0) continue;

    for (const [planIndex, [offset, nights, status]] of plans.entries()) {
      // Mỗi khách sạn lệch vài ngày để lịch tổng không chồng hết lên nhau
      const checkIn = dayOffset(offset + hotelIndex);
      const room = pick(hotel.rooms, planIndex);
      const roomQuantity = 1;
      const unitPrice = room.basePrice;
      const amounts = money(unitPrice.mul(nights * roomQuantity));
      const code = formatEntityCode("HB", randomUUID());

      await prisma.hotelBooking.create({
        data: {
          code,
          ...contact(pick(customers, count)),
          providerProfileId: hotel.providerProfileId,
          roomId: room.id,
          hotelName: hotel.name,
          roomName: room.name,
          checkInDate: checkIn,
          checkOutDate: new Date(checkIn.getTime() + nights * DAY_MS),
          nights,
          roomQuantity,
          guests: Math.min(room.capacity, 2),
          status,
          unitPrice,
          ...amounts,
          ...statusDates(status),
          ...(status === "cancelled"
            ? {}
            : { payments: { create: paymentFor(code, amounts.totalAmount) } }),
        },
      });
      count += 1;
    }
  }

  return count;
}

async function seedRestaurantBookings(customers: Customer[]) {
  const restaurants = await prisma.restaurant.findMany({
    where: {
      deletedAt: null,
      providerProfile: { businessType: "restaurant", approvalStatus: "approved" },
    },
    include: { timeSlots: { orderBy: { startTime: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const plans: [number, BookingStatus][] = [
    [-7, "completed"],
    [-2, "no_show"],
    [0, "confirmed"],
    [2, "pending_confirmation"],
    [5, "confirmed"],
    [11, "cancelled"],
    [16, "pending_confirmation"],
  ];
  let count = 0;

  for (const [restaurantIndex, restaurant] of restaurants.entries()) {
    if (restaurantIndex === 0 || restaurant.timeSlots.length === 0) continue;

    for (const [planIndex, [offset, status]] of plans.entries()) {
      const slot = pick(restaurant.timeSlots, planIndex + restaurantIndex);
      await prisma.restaurantBooking.create({
        data: {
          code: formatEntityCode("RB", randomUUID()),
          ...contact(pick(customers, count)),
          providerProfileId: restaurant.providerProfileId,
          restaurantId: restaurant.id,
          restaurantTimeSlotId: slot.id,
          restaurantName: restaurant.name,
          reservationDate: dayOffset(offset + restaurantIndex),
          startTime: slot.startTime,
          guests: 2 + ((planIndex + restaurantIndex) % 5),
          status,
          ...statusDates(status),
        },
      });
      count += 1;
    }
  }

  return count;
}

export async function seedBookings() {
  const customers = await prisma.user.findMany({
    where: { role: "customer" },
    select: { id: true, fullname: true, phone: true, email: true },
    orderBy: { createdAt: "asc" },
  });
  if (customers.length === 0) {
    console.warn("⚠ Bỏ qua seed booking: chưa có tài khoản khách hàng.");
    return;
  }

  await clearSeedBookings();

  console.log(`✓ ${await seedTourBookings(customers)} đơn đặt tour`);
  console.log(`✓ ${await seedHotelBookings(customers)} đơn đặt phòng`);
  console.log(`✓ ${await seedRestaurantBookings(customers)} đơn đặt bàn`);
}

if (process.argv[1]?.endsWith("seed-booking.ts")) {
  seedBookings()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
