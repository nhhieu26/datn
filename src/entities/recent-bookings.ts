import type { BookingStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type RecentBookingType = "tour" | "hotel" | "restaurant";

export type RecentBooking = {
  id: string;
  type: RecentBookingType;
  code: string;
  title: string;
  // Ngày sử dụng dịch vụ: khởi hành / nhận phòng / đặt bàn
  serviceDate: Date;
  guests: number;
  status: BookingStatus;
  // Đặt bàn nhà hàng không thu tiền qua nền tảng
  totalAmount: number | null;
  customerName: string;
  providerName: string;
  createdAt: Date;
};

// customer: booking do người dùng đặt; provider: booking các hồ sơ của họ nhận được
export type RecentBookingScope =
  | { customerId: string }
  | { providerUserId: string };

const base = {
  id: true,
  code: true,
  guests: true,
  status: true,
  contactName: true,
  createdAt: true,
  providerProfile: { select: { businessName: true } },
} as const;

/** `take` booking mới nhất, gộp từ cả ba loại dịch vụ. */
export async function findRecentBookings(
  scope: RecentBookingScope,
  take: number,
): Promise<RecentBooking[]> {
  const where =
    "customerId" in scope
      ? { customerId: scope.customerId }
      : { providerProfile: { userId: scope.providerUserId } };
  const page = { where, orderBy: { createdAt: "desc" }, take } as const;

  const [tours, hotels, restaurants] = await Promise.all([
    prisma.tourBooking.findMany({
      ...page,
      select: {
        ...base,
        tourTitle: true,
        departureDate: true,
        totalAmount: true,
      },
    }),
    prisma.hotelBooking.findMany({
      ...page,
      select: {
        ...base,
        hotelName: true,
        roomName: true,
        checkInDate: true,
        totalAmount: true,
      },
    }),
    prisma.restaurantBooking.findMany({
      ...page,
      select: { ...base, restaurantName: true, reservationDate: true },
    }),
  ]);

  const common = (b: (typeof tours)[number] | (typeof hotels)[number] | (typeof restaurants)[number]) => ({
    id: b.id,
    code: b.code,
    guests: b.guests,
    status: b.status,
    customerName: b.contactName,
    providerName: b.providerProfile.businessName,
    createdAt: b.createdAt,
  });

  const merged: RecentBooking[] = [
    ...tours.map((b) => ({
      ...common(b),
      type: "tour" as const,
      title: b.tourTitle,
      serviceDate: b.departureDate,
      totalAmount: Number(b.totalAmount),
    })),
    ...hotels.map((b) => ({
      ...common(b),
      type: "hotel" as const,
      title: `${b.hotelName} · ${b.roomName}`,
      serviceDate: b.checkInDate,
      totalAmount: Number(b.totalAmount),
    })),
    ...restaurants.map((b) => ({
      ...common(b),
      type: "restaurant" as const,
      title: b.restaurantName,
      serviceDate: b.reservationDate,
      totalAmount: null,
    })),
  ];

  return merged
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, take);
}
